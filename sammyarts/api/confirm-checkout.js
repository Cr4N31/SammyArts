import { confirmCheckout } from "../server/createCheckout.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const checkoutId =
      req.query?.checkout_id ||
      new URL(req.url, "http://localhost").searchParams.get("checkout_id");
    const result = await confirmCheckout(checkoutId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Confirm failed" });
  }
}
