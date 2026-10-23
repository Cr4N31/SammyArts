import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../data/firebase";

const MAX_EDGE = 2400;
const JPEG_QUALITY = 0.92;
const MIN_QUALITY = 0.86;
const MAX_DATA_CHARS = 900_000;
const MAX_FILE_BYTES = 40 * 1024 * 1024;
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
  if (dataUrl.length < 180_000) writeDisk(id, dataUrl);
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

function readAsDataUrl(source) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(source);
  });
}

async function encodeJpeg(source, width, height, quality) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(source, 0, 0, width, height);
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
  if (!blob) throw new Error("Could not process that image.");
  return blob;
}

async function compressToDataUrl(file) {
  if (file.size <= 650_000) {
    const original = await readAsDataUrl(file);
    if (original.length <= MAX_DATA_CHARS) return original;
  }

  const decoded = await createImageBitmap(file);
  const longest = Math.max(decoded.width, decoded.height);
  let edge = Math.min(MAX_EDGE, longest);
  let quality = JPEG_QUALITY;

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const scale = Math.min(1, edge / longest);
      const width = Math.max(1, Math.round(decoded.width * scale));
      const height = Math.max(1, Math.round(decoded.height * scale));
      const blob = await encodeJpeg(decoded, width, height, quality);
      if (blob.size <= 850_000) return readAsDataUrl(blob);
      edge = Math.round(edge * 0.8);
      quality = MIN_QUALITY;
    }
  } finally {
    decoded.close();
  }

  throw new Error(
    "That image is still too large after compressing. Try a smaller file.",
  );
}

async function storeDataUrl(dataUrl) {
  if (!db || !auth?.currentUser) {
    throw new Error("Sign in to the admin before uploading.");
  }
  if (dataToRef.has(dataUrl)) return dataToRef.get(dataUrl);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await setDoc(doc(db, "images", id), { data: dataUrl });
  const ref = `${PREFIX}${id}`;
  remember(id, dataUrl, ref);
  return ref;
}

export async function uploadImage(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("That image is larger than 40 MB.");
  }
  const dataUrl = await compressToDataUrl(file);
  await storeDataUrl(dataUrl);
  return dataUrl;
}

export async function uploadLocalPath(path) {
  if (!path?.startsWith("/uploads/")) return path;
  const res = await fetch(path);
  if (!res.ok) return path;
  const blob = await res.blob();
  const file = new File([blob], path.split("/").pop() || "image.jpg", {
    type: blob.type || "image/jpeg",
  });
  const dataUrl = await compressToDataUrl(file);
  return storeDataUrl(dataUrl);
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

/** Keep content docs small: store fsimg refs, not huge data URLs. */
export async function persistImageField(value) {
  if (!value) return "";
  if (isFirestoreImage(value)) return value;
  if (dataToRef.has(value)) return dataToRef.get(value);
  if (value.startsWith("data:image/")) return storeDataUrl(value);
  return value.slice(0, 2000);
}

export function displayImage(value) {
  if (!value) return "";
  if (!isFirestoreImage(value)) return value;
  return peekImage(value);
}
