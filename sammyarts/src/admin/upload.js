import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../data/firebase";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const KEEP_ORIGINAL_BYTES = 6 * 1024 * 1024;
const MAX_EDGE = 3000;
const WEBP_QUALITY = 0.92;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const PREFIX = "fsimg:";
const DISK_KEY = "sammyarts-img-v1";

const cache = new Map();
const dataToRef = new Map();
const inflight = new Map();

export function isFirestoreImage(value) {
  return typeof value === "string" && value.startsWith(PREFIX);
}

function firestoreImageId(value) {
  return isFirestoreImage(value) ? value.slice(PREFIX.length) : "";
}

function readDisk() {
  try {
    return JSON.parse(localStorage.getItem(DISK_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeDisk(id, dataUrl) {
  try {
    const all = readDisk();
    all[id] = dataUrl;
    const keys = Object.keys(all);
    if (keys.length > 48) {
      for (const key of keys.slice(0, keys.length - 48)) delete all[key];
    }
    localStorage.setItem(DISK_KEY, JSON.stringify(all));
  } catch {
    try {
      localStorage.setItem(DISK_KEY, JSON.stringify({ [id]: dataUrl }));
    } catch {
      /* quota full */
    }
  }
}

function remember(id, dataUrl, ref) {
  cache.set(id, dataUrl);
  if (ref) dataToRef.set(dataUrl, ref);
  writeDisk(id, dataUrl);
}

/** Sync lookup from memory / localStorage. No network. */
export function peekImage(value) {
  if (!value) return "";
  if (!isFirestoreImage(value)) return value;
  const id = firestoreImageId(value);
  if (cache.has(id)) return cache.get(id);
  const disk = readDisk()[id];
  if (disk) {
    cache.set(id, disk);
    dataToRef.set(disk, value);
    return disk;
  }
  return "";
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

export async function resolveImage(value) {
  if (!value) return "";
  if (!isFirestoreImage(value)) return value;

  const peeked = peekImage(value);
  if (peeked) return peeked;

  const id = firestoreImageId(value);
  if (inflight.has(id)) return inflight.get(id);

  if (!db) return "";

  const request = getDoc(doc(db, "images", id))
    .then((snap) => {
      if (!snap.exists()) return "";
      const dataUrl = String(snap.data()?.data || "");
      if (dataUrl) remember(id, dataUrl, value);
      return dataUrl;
    })
    .finally(() => {
      inflight.delete(id);
    });

  inflight.set(id, request);
  return request;
}

/** Keep content docs small: store links / fsimg refs, never raw data URLs. */
export async function persistImageField(value) {
  if (!value) return "";
  if (isFirestoreImage(value)) return value;
  if (dataToRef.has(value)) return dataToRef.get(value);
  if (value.startsWith("data:image/")) {
    const blob = await (await fetch(value)).blob();
    return uploadBlob(blob, "image.jpg");
  }
  return value.slice(0, 2000);
}

export function displayImage(value) {
  if (!value) return "";
  if (!isFirestoreImage(value)) return value;
  return peekImage(value);
}
