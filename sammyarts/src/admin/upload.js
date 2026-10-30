import { auth } from "../data/firebase";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const KEEP_ORIGINAL_BYTES = 6 * 1024 * 1024;
const MAX_EDGE = 3000;
const WEBP_QUALITY = 0.92;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

try {
  localStorage.removeItem("sammyarts-img-v1");
} catch {
  /* storage unavailable */
}

function fileToBitmap(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

/** Small files go up untouched; big ones are resized to a sharp 3000px WebP. */
async function prepareFile(file) {
  if (file.size <= KEEP_ORIGINAL_BYTES || /gif|svg/.test(file.type)) {
    return file;
  }
  const img = await fileToBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
  if (!blob || blob.type !== "image/webp" || blob.size >= file.size) {
    return file;
  }
  const base = (file.name || "image").replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

async function sendToStorage(file) {
  if (!auth?.currentUser) {
    throw new Error("Sign in to the admin before uploading.");
  }
  const idToken = await auth.currentUser.getIdToken();

  const res = await fetch("/api/image-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, name: file.name, type: file.type }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.uploadUrl) {
    throw new Error(data?.error || "Could not start the upload.");
  }

  const form = new FormData();
  form.append("cacheControl", "31536000");
  form.append("", file);
  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    body: form,
    headers: {
      "x-upsert": "false",
      ...(SUPABASE_KEY ? { apikey: SUPABASE_KEY } : {}),
    },
  });
  if (!put.ok) {
    const body = await put.json().catch(() => ({}));
    throw new Error(body?.message || body?.error || "Upload failed.");
  }
  return data.publicUrl;
}

export async function uploadImage(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("That image is larger than 50 MB.");
  }
  return sendToStorage(await prepareFile(file));
}

async function uploadBlob(blob, name) {
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });
  return uploadImage(file);
}

export async function uploadLocalPath(path) {
  if (!path?.startsWith("/uploads/")) return path;
  const res = await fetch(path);
  if (!res.ok) return path;
  return uploadBlob(await res.blob(), path.split("/").pop() || "image.jpg");
}

/** Keep content docs small: store image links, never raw data URLs. */
export async function persistImageField(value) {
  if (!value) return "";
  if (value.startsWith("data:image/")) {
    const blob = await (await fetch(value)).blob();
    return uploadBlob(blob, "image.jpg");
  }
  return value.slice(0, 2000);
}
