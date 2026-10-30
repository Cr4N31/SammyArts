const BUCKET = "images";
const MAX_BUCKET_BYTES = 50 * 1024 * 1024;

let bucketReady = false;

function supabaseConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY || "";
  const missing = [
    !url && "VITE_SUPABASE_URL",
    !secret && "SUPABASE_SECRET_KEY",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(
      `Image storage is not set up yet. Missing on the server: ${missing.join(", ")}.`,
    );
  }
  return { url, secret };
}

function supabaseHeaders(secret) {
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

async function verifyAdmin(idToken) {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!idToken || !apiKey) {
    throw new Error("Sign in to the admin before uploading.");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  const data = await res.json().catch(() => ({}));
  const email = String(data?.users?.[0]?.email || "").toLowerCase();
  if (!res.ok || !email) {
    throw new Error("Your admin session expired. Sign in again.");
  }

  const admin = String(process.env.VITE_ADMIN_EMAIL || "").toLowerCase();
  if (admin && email !== admin) {
    throw new Error("This account cannot upload images.");
  }
}

async function ensureBucket({ url, secret }) {
  if (bucketReady) return;
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: supabaseHeaders(secret),
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: MAX_BUCKET_BYTES,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const text = JSON.stringify(body).toLowerCase();
    if (!text.includes("already exists") && !text.includes("duplicate")) {
      throw new Error(body?.message || "Could not prepare image storage.");
    }
  }
  bucketReady = true;
}

function safeExtension(name, type) {
  const fromName = String(name || "").split(".").pop()?.toLowerCase() || "";
  if (/^(jpe?g|png|webp|gif|avif|svg)$/.test(fromName)) return fromName;
  const fromType = String(type || "").split("/").pop()?.toLowerCase() || "";
  if (fromType === "svg+xml") return "svg";
  if (/^(jpe?g|png|webp|gif|avif)$/.test(fromType)) return fromType;
  return "jpg";
}

export async function createImageUpload(body) {
  await verifyAdmin(body?.idToken);
  const config = supabaseConfig();
  await ensureBucket(config);

  const ext = safeExtension(body?.name, body?.type);
  const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;

  const res = await fetch(
    `${config.url}/storage/v1/object/upload/sign/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: supabaseHeaders(config.secret),
      body: JSON.stringify({ upsert: false }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.message || "Could not start the upload.");
  }

  return {
    uploadUrl: `${config.url}/storage/v1${data.url}`,
    publicUrl: `${config.url}/storage/v1/object/public/${BUCKET}/${path}`,
  };
}
