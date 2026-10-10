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

function bachsBaseUrl(apiKey) {
  return String(apiKey || "").startsWith("sk_live_")
    ? "https://api.bachs.io"
    : "https://sandbox-api.bachs.io";
}

function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("This course has no price yet.");
  }
  return amount.toFixed(2);
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

export async function createCourseCheckout(req, body) {
  const apiKey = process.env.BACHS_API_KEY;
  if (!apiKey) throw new Error("BACHS_API_KEY is not set.");

  const courseKey = body?.course || body?.slug || body?.id;
  const course = await loadCourse(courseKey);
  const amount = formatAmount(course.price);
  const email = String(body?.email || "").trim();
  const name = String(body?.name || "").trim();
  if (!name) throw new Error("Name is required.");
  if (!email || !email.includes("@")) throw new Error("Email is required.");

  const base = siteBase(req);
  const coursePath = encodeURIComponent(course.slug || course.id);

  const payload = {
    pricing: {
      currency: "NGN",
      amount,
    },
    billing_currency: "NGN",
    payment_method_types: ["NGN_CARD", "NGN_BANK_TRANSFER"],
    customer: { email, name },
    success_url: `${base}/checkout/success?course=${coursePath}`,
    cancel_url: `${base}/checkout/${coursePath}?cancelled=1`,
    reference: `sa_${course.id}_${Date.now()}`.slice(0, 128),
    metadata: {
      courseId: String(course.id),
      courseSlug: String(course.slug || ""),
      courseTitle: String(course.title || "").slice(0, 120),
      courseType: course.type === "mentorship" ? "mentorship" : "course",
      billing: String(course.billing || "one-time").slice(0, 40),
      buyerName: name.slice(0, 120),
      buyerEmail: email.slice(0, 160),
    },
    customer_creation: "always",
  };

  const response = await fetch(
    `${bachsBaseUrl(apiKey)}/v1/checkout-sessions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      data?.error_code ||
      `Checkout failed (${response.status})`;
    throw new Error(detail);
  }

  if (!data.checkout_url) {
    throw new Error("Payment did not return a checkout URL.");
  }

  return {
    checkout_id: data.checkout_id,
    checkout_url: data.checkout_url,
    status: data.status,
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
  const value = String(status || "").toLowerCase();
  return value === "completed" || value === "paid" || value === "succeeded";
}

function buyerFromSession(data) {
  const details = data?.customer_details || {};
  const customer = data?.customer || {};
  const meta = data?.metadata || {};
  return {
    name: String(
      details.name || customer.name || meta.buyerName || "",
    ).slice(0, 120),
    email: String(
      details.email || customer.email || meta.buyerEmail || "",
    ).slice(0, 160),
  };
}

export async function recordPurchase(session) {
  const checkoutId = String(session.checkout_id || "").trim();
  if (!checkoutId || !isPaidStatus(session.status)) return null;

  const meta = session.metadata || {};
  const buyer = buyerFromSession(session);
  const amount = String(
    session.amount || session.pricing?.amount || meta.amount || "",
  );
  const currency = String(
    session.currency || session.pricing?.currency || "NGN",
  ).slice(0, 8);

  const payload = {
    checkoutId,
    name: buyer.name,
    email: buyer.email,
    courseId: String(meta.courseId || "").slice(0, 40),
    courseSlug: String(meta.courseSlug || "").slice(0, 120),
    courseTitle: String(meta.courseTitle || "").slice(0, 120),
    courseType:
      meta.courseType === "mentorship" ? "mentorship" : "course",
    billing: String(meta.billing || "one-time").slice(0, 40),
    amount,
    currency,
    status: "paid",
    updatedAt: serverTimestamp(),
  };

  const ref = doc(getFirestore(firebaseApp()), "orders", checkoutId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(ref, payload, { merge: true });
  return payload;
}

export async function fetchCheckoutSession(checkoutId) {
  const apiKey = process.env.BACHS_API_KEY;
  if (!apiKey) throw new Error("BACHS_API_KEY is not set.");

  const id = String(checkoutId || "").trim();
  if (!id) throw new Error("Missing checkout id.");

  const response = await fetch(
    `${bachsBaseUrl(apiKey)}/v1/checkout-sessions/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      data?.error_code ||
      `Could not confirm checkout (${response.status})`;
    throw new Error(detail);
  }

  return {
    ...data,
    checkout_id: data.checkout_id || id,
    status: data.status || "unknown",
    metadata: data.metadata || {},
    amount: data.amount || data.pricing?.amount || null,
    currency: data.currency || data.pricing?.currency || "NGN",
  };
}

export async function confirmCheckout(checkoutId) {
  const data = await fetchCheckoutSession(checkoutId);
  if (isPaidStatus(data.status)) {
    try {
      await recordPurchase(data);
    } catch (err) {
      console.error("Could not save purchase:", err);
    }
  }

  const buyer = buyerFromSession(data);
  return {
    checkout_id: data.checkout_id,
    status: data.status,
    metadata: data.metadata,
    amount: data.amount,
    currency: data.currency,
    name: buyer.name,
    email: buyer.email,
  };
}
