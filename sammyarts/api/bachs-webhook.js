import { createHmac, timingSafeEqual } from "node:crypto";
import {
  fetchCheckoutSession,
  recordPurchase,
} from "../server/createCheckout.js";

function verifySignature(rawBody, secret, timestampHeader, signatureHeader) {
  if (!secret || !timestampHeader || !signatureHeader) return false;
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(String(signatureHeader));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function verifySignatureV2(rawBody, secret, header) {
  if (!secret || !header) return false;
  const parts = String(header)
    .split(",")
    .map((part) => part.trim().split("="))
    .filter((pair) => pair.length === 2);
  const map = Object.fromEntries(parts);
  const timestamp = Number(map.t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  return signatures.some((signature) => {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const secret = process.env.BACHS_WEBHOOK_SECRET || "";
    const v2 = req.headers["x-bachs-signature-v2"];
    const v1 = req.headers["x-bachs-signature"];
    const timestamp = req.headers["x-bachs-timestamp"];

    const ok =
      verifySignatureV2(rawBody, secret, v2) ||
      verifySignature(rawBody, secret, timestamp, v1);

    if (secret && !ok) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = JSON.parse(rawBody || "{}");
    const type = String(event.type || "");
    const checkoutId =
      event.data?.checkout_id ||
      event.data?.checkoutId ||
      event.data?.id ||
      "";

    if (
      checkoutId &&
      (type === "checkout.completed" ||
        type === "collection.succeeded" ||
        type.startsWith("checkout.") ||
        type.startsWith("collection."))
    ) {
      const session = await fetchCheckoutSession(checkoutId);
      await recordPurchase(session);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Webhook failed" });
  }
}
