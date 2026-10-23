import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../data/firebase";

const MAX_EDGE = 960;
const JPEG_QUALITY = 0.65;
const MAX_DATA_CHARS = 700_000;
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

async function compressToDataUrl(file) {
  const img = await fileToBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_CHARS && quality > 0.4) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_DATA_CHARS) {
    throw new Error(
      "That image is still too large after compressing. Try a smaller file.",
    );
  }
  return dataUrl;
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
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("That image is larger than 8 MB.");
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
