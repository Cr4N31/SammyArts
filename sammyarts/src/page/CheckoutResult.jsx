import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

function CheckMark({ reduce }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="grid h-16 w-16 place-items-center rounded-full border border-accent/50 text-accent md:h-20 md:w-20"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 md:h-10 md:w-10"
      >
        <motion.path
          d="M5 12.5l4.5 4.5L19 7"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        />
      </svg>
    </motion.span>
  );
}

function CheckoutResult() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const course = params.get("course") || "";
  const [status, setStatus] = useState(reference ? "checking" : "completed");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!reference) return undefined;
    let cancelled = false;

    async function confirm() {
      try {
        const res = await fetch(
          `/api/confirm-checkout?reference=${encodeURIComponent(reference)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Could not confirm payment.");
        setStatus(String(data.status || "unknown").toLowerCase());
        setDetail(data.metadata?.courseTitle || "");
        setEmail(data.email || "");
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
  }, [reference]);

  const paid =
    !reference ||
    status === "success" ||
    status === "completed" ||
    status === "paid" ||
    status === "succeeded";
  const checking = status === "checking";
  const failed = status === "error";

  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(247,142,72,0.14),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-2xl">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {checking ? (
            <p className="text-xs uppercase tracking-[0.3em] text-cream/50">
              Almost there
            </p>
          ) : failed ? (
            <p className="text-xs uppercase tracking-[0.3em] text-cream/50">
              Payment
            </p>
          ) : (
            <CheckMark reduce={reduce} />
          )}

          <h1 className="mt-6 font-serif text-[clamp(2.75rem,7vw,5rem)] italic leading-[0.95] tracking-[-0.04em]">
            {checking
              ? "Confirming your payment"
              : failed
                ? "Something went wrong"
                : "Payment successful"}
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/70 md:text-lg">
            {checking
              ? "Hold on a moment while we confirm your purchase."
              : failed
                ? detail
                : detail
                  ? `You are enrolled in ${detail}. We will reach out${email ? ` at ${email}` : " by email"} with next steps.`
                  : "Thank you. We will reach out by email with next steps."}
          </p>

          {!checking && !failed ? (
            <p className="mt-4 text-sm text-cream/50">
              A receipt may also arrive from the payment page.
            </p>
          ) : null}

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              to="/atelier"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-brand transition-colors hover:bg-accent-hover"
            >
              Browse courses
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-accent"
            >
              Back home
            </Link>
            {failed && course ? (
              <Link
                to={`/checkout/${encodeURIComponent(course)}`}
                className="inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-accent"
              >
                Try again
              </Link>
            ) : null}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default CheckoutResult;
