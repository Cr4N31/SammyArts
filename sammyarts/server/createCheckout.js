import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, getApps } from "firebase/app";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAYSTACK_API = "https://api.paystack.co";

function localCourses() {
  try {
    const raw = readFileSync(
      join(__dirname, "../src/data/courses.json"),
      "utf8",
    );
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function paystackKey() {
  const key = String(process.env.PAYSTACK_SECRET_KEY || "").trim();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set.");
  return key;
}

function nairaToKobo(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("This course has no price yet.");
  }
  return Math.round(amount * 100);
}

function koboToNaira(value) {
  const kobo = Number(value);
  if (!Number.isFinite(kobo)) return "";
  return (kobo / 100).toFixed(2);
}

function firebaseApp() {
  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId) {
    throw new Error("Firebase is not configured on the server.");
  }
  return getApps()[0] || initializeApp(config);
}

async function loadCourse(slugOrId) {
  const key = String(slugOrId || "").trim();
  if (!key) throw new Error("Missing course.");

  const match = (items) =>
    (items || []).find(
      (item) =>
        String(item?.slug || "") === key || String(item?.id || "") === key,
    );

  try {
    const snap = await getDoc(
      doc(getFirestore(firebaseApp()), "content", "courses"),
    );
    if (snap.exists()) {
      const course = match(snap.data()?.items);
      if (course) return course;
    }
  } catch {
    // Fall through to local catalog.
  }

  const local = match(localCourses());
  if (!local) throw new Error("Course not found.");
  return local;
}

function siteBase(req) {
  const configured = String(process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (configured) return configured;

  const host = String(
    req.headers["x-forwarded-host"] || req.headers.host || "",
  ).split(",")[0].trim();
  const proto = String(
    req.headers["x-forwarded-proto"] || "https",
  ).split(",")[0].trim();

  if (!host || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) {
    throw new Error(
      "Set PUBLIC_SITE_URL to your live site URL (payment cannot redirect to localhost).",
    );
  }

  return `${proto}://${host}`;
}

function courseMeta(course, name, email) {
  return {
    courseId: String(course.id),
    courseSlug: String(course.slug || ""),
    courseTitle: String(course.title || "").slice(0, 120),
    courseType: course.type === "mentorship" ? "mentorship" : "course",
    billing: String(course.billing || "one-time").slice(0, 40),
    buyerName: name.slice(0, 120),
    buyerEmail: email.slice(0, 160),
  };
}

export async function createCourseCheckout(req, body) {
  const secret = paystackKey();
  const courseKey = body?.course || body?.slug || body?.id;
  const course = await loadCourse(courseKey);
  const email = String(body?.email || "").trim();
  const name = String(body?.name || "").trim();
  if (!name) throw new Error("Name is required.");
  if (!email || !email.includes("@")) throw new Error("Email is required.");

  const base = siteBase(req);
  const coursePath = encodeURIComponent(course.slug || course.id);
  const reference = `sa_${course.id}_${Date.now()}`.slice(0, 100);
  const metadata = courseMeta(course, name, email);

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: nairaToKobo(course.price),
      currency: "NGN",
      reference,
      callback_url: `${base}/checkout/success?course=${coursePath}`,
      channels: ["card", "bank", "ussd", "bank_transfer"],
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: "Name",
            variable_name: "buyer_name",
            value: name.slice(0, 120),
          },
          {
            display_name: "Course",
            variable_name: "course_title",
            value: String(course.title || "").slice(0, 120),
          },
        ],
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === false) {
    throw new Error(data.message || `Checkout failed (${response.status})`);
  }

  const checkoutUrl = data.data?.authorization_url;
  if (!checkoutUrl) {
    throw new Error("Payment did not return a checkout URL.");
  }

  return {
    reference: data.data.reference || reference,
    checkout_url: checkoutUrl,
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      type: course.type,
      price: course.price,
      billing: course.billing,
    },
  };
}

function isPaidStatus(status) {
  return String(status || "").toLowerCase() === "success";
}

function buyerFromCharge(data) {
  const meta = data?.metadata || {};
  const customer = data?.customer || {};
  return {
    name: String(meta.buyerName || customer.first_name || "").slice(0, 120),
    email: String(
      meta.buyerEmail || data?.customer?.email || customer.email || "",
    ).slice(0, 160),
  };
}

export async function recordPurchase(charge) {
  const reference = String(charge.reference || "").trim();
  if (!reference || !isPaidStatus(charge.status)) return null;

  const meta = charge.metadata || {};
  const buyer = buyerFromCharge(charge);
  const payload = {
    checkoutId: reference,
    name: buyer.name,
    email: buyer.email,
    courseId: String(meta.courseId || "").slice(0, 40),
    courseSlug: String(meta.courseSlug || "").slice(0, 120),
    courseTitle: String(meta.courseTitle || "").slice(0, 120),
    courseType: meta.courseType === "mentorship" ? "mentorship" : "course",
    billing: String(meta.billing || "one-time").slice(0, 40),
    amount: koboToNaira(charge.amount),
    currency: String(charge.currency || "NGN").slice(0, 8),
    status: "paid",
    updatedAt: serverTimestamp(),
  };

  const ref = doc(getFirestore(firebaseApp()), "orders", reference);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(ref, payload, { merge: true });
  return payload;
}

export async function fetchCharge(reference) {
  const secret = paystackKey();
  const id = String(reference || "").trim();
  if (!id) throw new Error("Missing payment reference.");

  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === false) {
    throw new Error(data.message || `Could not confirm payment (${response.status})`);
  }

  return data.data || {};
}

export async function confirmCheckout(reference) {
  const charge = await fetchCharge(reference);
  if (isPaidStatus(charge.status)) {
    try {
      await recordPurchase(charge);
    } catch (err) {
      console.error("Could not save purchase:", err);
    }
  }

  const buyer = buyerFromCharge(charge);
  return {
    reference: charge.reference || reference,
    status: charge.status || "unknown",
    metadata: charge.metadata || {},
    amount: koboToNaira(charge.amount),
    currency: charge.currency || "NGN",
    name: buyer.name,
    email: buyer.email,
  };
}
