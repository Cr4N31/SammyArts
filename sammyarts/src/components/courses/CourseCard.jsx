import { useEffect, useState } from "react";
import { motion } from "motion/react";
import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";

const MotionLi = motion.li;

function CourseCard({
  course,
  onBuy,
  index = 0,
  ratingSummary,
  onSubmitRating,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!ratingOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) setRatingOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ratingOpen, submitting]);

  function openRating(value) {
    setSelectedRating(value);
    setSubmitError("");
    setStatus("");
    setRatingOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmitRating(course, {
        rating: selectedRating,
        name,
        review,
      });
      setRatingOpen(false);
      setName("");
      setReview("");
      setStatus("Thank you. Your rating has been submitted.");
    } catch (error) {
      setSubmitError(error.message || "Could not submit your rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MotionLi
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: "easeOut" }}
      className="border-t border-border py-7 transition-colors duration-300 hover:bg-white/[0.02] motion-reduce:transition-none"
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-10">
        <div className="min-w-0">
          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            {String(index + 1).padStart(2, "0")}{" "}
            <span aria-hidden="true">/</span> {course.category}
          </p>
          <h3 className="break-words font-serif text-2xl leading-tight tracking-[-0.03em] md:text-3xl">
            {course.title}
          </h3>
        </div>

        <div className="min-w-36">
          <p className="mb-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            Rate
          </p>
          <div
            role="group"
            aria-label={`Rate ${course.title}`}
            className="flex items-center"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} out of 5 stars`}
                onClick={() => openRating(value)}
                className="grid min-h-9 min-w-8 place-items-center text-xl text-accent transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent motion-reduce:transition-none"
              >
                {value <= (ratingSummary?.average || 0) ? "★" : "☆"}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted" aria-live="polite">
            {ratingSummary?.count
              ? `${ratingSummary.average.toFixed(1)} · ${ratingSummary.count} ${
                  ratingSummary.count === 1 ? "rating" : "ratings"
                }`
              : "Not rated yet"}
          </p>
          {status ? (
            <p role="status" className="mt-1 text-xs text-accent">
              {status}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-5 md:justify-end">
          <PriceTag price={course.price} billing={course.billing} />
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            className="min-h-11 border-b border-current pb-1 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {detailsOpen ? "Close details" : "Course details"}
          </button>
        </div>
      </div>
      {detailsOpen ? (
        <div className="mt-6 border-t border-border/70 pt-5">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted">
              {course.desc || "No description yet."}
            </p>
            <BuyButton label="Buy course" onClick={() => onBuy(course)} />
          </div>
          {ratingSummary?.reviews?.length ? (
            <section aria-label={`Reviews for ${course.title}`} className="mt-6 grid gap-4">
              {ratingSummary.reviews.map((item) => (
                <article key={item.id} className="border-t border-border/60 pt-4">
                  <p className="text-xs text-accent">
                    {"★".repeat(item.rating)}
                    <span className="sr-only"> {item.rating} out of 5 stars</span>
                  </p>
                  {item.review ? (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text">
                      {item.review}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted">{item.name}</p>
                </article>
              ))}
            </section>
          ) : null}
        </div>
      ) : null}

      {ratingOpen ? (
        <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-brand/80 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`rating-title-${course.id}`}
            className="my-auto w-full max-w-lg border border-border bg-surface p-6 text-text md:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-accent">
                  Your rating · {selectedRating} of 5 stars
                </p>
                <h2
                  id={`rating-title-${course.id}`}
                  className="mt-3 font-serif text-3xl leading-tight tracking-[-0.03em]"
                >
                  {course.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close rating form"
                disabled={submitting}
                onClick={() => setRatingOpen(false)}
                className="min-h-11 border-b border-transparent pb-1 text-xs uppercase tracking-[0.14em] text-muted hover:border-border hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
              <p className="text-xs leading-relaxed text-muted">
                Your name and review will be visible publicly with this course.
              </p>
              <div>
                <label
                  htmlFor={`rating-name-${course.id}`}
                  className="mb-2 block text-xs uppercase tracking-[0.14em] text-muted"
                >
                  Your name
                </label>
                <input
                  autoFocus
                  id={`rating-name-${course.id}`}
                  name="name"
                  autoComplete="name"
                  maxLength={80}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full border-b border-border bg-transparent py-3 text-sm text-text outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                />
              </div>
              <div>
                <label
                  htmlFor={`rating-review-${course.id}`}
                  className="mb-2 block text-xs uppercase tracking-[0.14em] text-muted"
                >
                  Review <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id={`rating-review-${course.id}`}
                  name="review"
                  rows={4}
                  maxLength={1000}
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  placeholder="Share a little more about your experience"
                  className="w-full resize-y border border-border bg-transparent p-3 text-sm text-text outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                />
              </div>
              {submitError ? (
                <p role="alert" className="text-sm text-accent">
                  {submitError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="button-slide inline-flex min-h-11 items-center justify-center gap-2 border border-accent bg-brand px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting" : "Submit rating"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </MotionLi>
  );
}

export default CourseCard;
