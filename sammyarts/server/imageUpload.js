const BUCKET = "images";
const COURSE_FILES_BUCKET = "course-files";
const MAX_BUCKET_BYTES = 50 * 1024 * 1024;
const DOWNLOAD_LINK_SECONDS = 24 * 60 * 60;

const readyBuckets = new Set();

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

async function ensureBucket({ url, secret }, id = BUCKET, isPublic = true) {
  if (readyBuckets.has(id)) return;
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: supabaseHeaders(secret),
    body: JSON.stringify({
      id,
      name: id,
      public: isPublic,
      file_size_limit: MAX_BUCKET_BYTES,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const text = JSON.stringify(body).toLowerCase();
    if (!text.includes("already exists") && !text.includes("duplicate")) {
      throw new Error(body?.message || "Could not prepare file storage.");
    }
  }
  readyBuckets.add(id);
}

function courseFileExtension(name, type) {
  const fromName = String(name || "").split(".").pop()?.toLowerCase() || "";
  if (/^(pdf|jpe?g|png|webp|gif)$/.test(fromName)) return fromName;
  const fromType = String(type || "").split("/").pop()?.toLowerCase() || "";
  if (/^(pdf|jpe?g|png|webp|gif)$/.test(fromType)) return fromType;
  throw new Error("Course files must be a PDF or an image.");
}

async function createCourseFileUpload(body) {
  const config = supabaseConfig();
  await ensureBucket(config, COURSE_FILES_BUCKET, false);

  const ext = courseFileExtension(body?.name, body?.type);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const res = await fetch(
    `${config.url}/storage/v1/object/upload/sign/${COURSE_FILES_BUCKET}/${path}`,
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
    path,
  };
}

/** Private course files are only reachable through short-lived signed links. */
export async function signCourseFileDownload(path, downloadName) {
  const config = supabaseConfig();
  const res = await fetch(
    `${config.url}/storage/v1/object/sign/${COURSE_FILES_BUCKET}/${path}`,
    {
      method: "POST",
      headers: supabaseHeaders(config.secret),
      body: JSON.stringify({ expiresIn: DOWNLOAD_LINK_SECONDS }),
    },
  );
  const data = await res.json().catch(() => ({}));
  const signed = data?.signedURL || data?.signedUrl;
  if (!res.ok || !signed) {
    throw new Error(data?.message || "Could not prepare the course download.");
  }
  const link = `${config.url}/storage/v1${signed}`;
  return downloadName
    ? `${link}&download=${encodeURIComponent(downloadName)}`
    : link;
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
  if (body?.kind === "courseFile") return createCourseFileUpload(body);
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
