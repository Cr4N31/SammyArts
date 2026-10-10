import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useContent } from "../data/content";
import PriceTag from "../components/courses/PriceTag";

const fieldClass =
  "w-full border-b border-accent/50 bg-transparent py-3 text-base text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-accent";

const labelClass = "text-xs uppercase tracking-[0.14em] text-cream/50";

function Checkout() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { courses } = useContent();
  const cancelled = params.get("cancelled") === "1";

  const course = useMemo(
    () =>
      courses.find(
        (item) =>
          String(item.slug) === String(slug) || String(item.id) === String(slug),
      ),
    [courses, slug],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPay(e) {
    e.preventDefault();
    if (!course || busy) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: course.slug || course.id,
          email: email.trim(),
          name: name.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error || "Could not start payment.");
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.message || "Could not start payment.");
      setBusy(false);
    }
  }

  if (!course) {
    return (
      <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cream/50">
            Checkout
          </p>
          <h1 className="mt-4 font-serif text-4xl italic tracking-[-0.03em]">
            This course is not on the site.
          </h1>
          <Link
            to="/atelier"
            className="mt-8 inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 hover:text-accent"
          >
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={onPay}>
          <Link
            to="/atelier"
            className="inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 hover:text-accent"
          >
            All courses
          </Link>
          <p className="mt-10 text-xs uppercase tracking-[0.3em] text-cream/50">
            Checkout
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.5rem,6vw,4.5rem)] italic leading-[0.95] tracking-[-0.04em]">
            {course.title}
          </h1>
          <p className="mt-3 text-sm text-cream/60">
            {course.type === "mentorship" ? "Mentorship" : "Course"}
            {course.billing === "per month" ? " · billed monthly" : ""}
          </p>

          {cancelled ? (
            <p className="mt-6 text-sm text-accent" role="status">
              Payment was cancelled. You can try again below.
            </p>
          ) : null}

          {course.desc ? (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/70">
              {course.desc}
            </p>
          ) : null}

          <div className="mt-10 grid gap-6">
            <div>
              <label htmlFor="checkout-name" className={labelClass}>
                Name
              </label>
              <input
                id="checkout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="checkout-email" className={labelClass}>
                Email
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-6 text-sm text-accent">
              {error}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={busy || !course.price}
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-brand transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Redirecting" : "Pay"}
            </button>
            <button
              type="button"
              className="text-xs uppercase tracking-[0.18em] text-cream/50 hover:text-accent"
              onClick={() => navigate("/atelier")}
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="border border-cream/10 bg-surface/40 p-6">
          {course.img ? (
            <img
              src={course.img}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          ) : null}
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-cream/50">
            Total
          </p>
          <div className="mt-3">
            <PriceTag price={course.price} billing={course.billing} size="lg" />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
