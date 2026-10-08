import { ADMIN_PASSWORD } from "./gate";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadImage(file) {
  if (!TYPES.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("That image is larger than 8 MB.");
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file.type,
      "x-admin-key": ADMIN_PASSWORD,
      "x-file-name": file.name,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error("Upload failed. Keep the preview running and try again.");
  }

  const data = await res.json();
  return data.url;
}
