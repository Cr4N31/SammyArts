import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function CheckoutResult() {
  const [params] = useSearchParams();
  const checkoutId = params.get("checkout_id") || "";
  const course = params.get("course") || "";
  const [status, setStatus] = useState(checkoutId ? "checking" : "done");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!checkoutId) return undefined;
    let cancelled = false;

    async function confirm() {
      try {
        const res = await fetch(
          `/api/confirm-checkout?checkout_id=${encodeURIComponent(checkoutId)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Could not confirm payment.");
        setStatus(String(data.status || "unknown").toLowerCase());
        setDetail(data.metadata?.courseTitle || "");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setDetail(err.message || "Could not confirm payment.");
      }
    }

    confirm();
    return () => {
      cancelled = true;
    };
  }, [checkoutId]);

  const paid = status === "completed" || status === "paid" || status === "succeeded";

  return (
    <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cream/50">
          Checkout
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2.5rem,6vw,4rem)] italic leading-[0.95] tracking-[-0.04em]">
          {status === "checking"
            ? "Confirming payment"
            : status === "error"
              ? "Could not confirm"
              : paid
                ? "You are in"
                : "Payment received"}
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-cream/70">
          {status === "checking"
            ? "Hold on while we confirm your payment."
            : status === "error"
              ? detail
              : paid
                ? `Thanks${detail ? ` for buying ${detail}` : ""}. We will follow up by email with next steps.`
                : "If you just paid, give it a moment — confirmation can take a few seconds."}
        </p>
        <div className="mt-10 flex flex-wrap gap-6">
          <Link
            to="/atelier"
            className="inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 hover:text-accent"
          >
            Back to courses
          </Link>
          {course ? (
            <Link
              to={`/checkout/${encodeURIComponent(course)}`}
              className="inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 hover:text-accent"
            >
              View course
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default CheckoutResult;
