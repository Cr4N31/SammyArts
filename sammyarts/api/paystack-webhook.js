import { createHmac, timingSafeEqual } from "node:crypto";
import { recordPurchase } from "../server/createCheckout.js";

function verifySignature(rawBody, secret, signatureHeader) {
  if (!secret || !signatureHeader) return false;
  const expected = createHmac("sha512", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signatureHeader));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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
    const secret = String(process.env.PAYSTACK_SECRET_KEY || "").trim();
    const signature = req.headers["x-paystack-signature"];

    if (!verifySignature(rawBody, secret, signature)) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = JSON.parse(rawBody || "{}");
    if (event.event === "charge.success" && event.data) {
      await recordPurchase(event.data);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Webhook failed" });
  }
}
