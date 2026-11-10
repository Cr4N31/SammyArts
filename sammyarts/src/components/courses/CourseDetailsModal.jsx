import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";

function CourseDetailsModal({ course, courses, ratings, onBuy, onClose }) {
  const [activeCourse, setActiveCourse] = useState(course);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  const ratingSummary = ratings[activeCourse.slug || String(activeCourse.id)];
  const nextCourses = courses.filter((item) => item.id !== activeCourse.id);
  const selectCourse = useCallback((nextCourse) => {
    setActiveCourse(nextCourse);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!controls?.length) return;

      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[110] bg-brand"
      onWheel={(event) => {
        event.preventDefault();
        if (contentRef.current) {
          contentRef.current.scrollTop += event.deltaY;
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-details-title"
        ref={dialogRef}
        className="grid h-dvh w-full grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-bg text-text md:grid-cols-[minmax(0,1fr)_24rem] md:grid-rows-1"
      >
        <div
          ref={contentRef}
          data-lenis-prevent
          className="min-h-0 overflow-y-auto overscroll-contain px-6 py-7 md:px-12 md:py-12"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {activeCourse.category ||
              (activeCourse.type === "mentorship" ? "Mentorship" : "Course")}
          </p>
          <h2
            id="course-details-title"
            className="mt-4 max-w-3xl break-words font-serif text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.045em]"
          >
            {activeCourse.title}
          </h2>

          <section aria-labelledby="course-about-heading" className="mt-10">
            <h3
              id="course-about-heading"
              className="border-b border-border pb-3 text-xs uppercase tracking-[0.16em] text-muted"
            >
              About this course
            </h3>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-text/85">
              {activeCourse.desc || "Course description coming soon."}
            </p>
          </section>

          <section
            aria-labelledby="course-reviews-heading"
            className="mt-10 border-t border-border pt-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3
                id="course-reviews-heading"
                className="font-serif text-2xl tracking-[-0.03em]"
              >
                Student reviews
              </h3>
              <p className="text-xs text-muted">
                {ratingSummary?.count
                  ? `${ratingSummary.average.toFixed(1)} average · ${ratingSummary.count} ${
                      ratingSummary.count === 1 ? "rating" : "ratings"
                    }`
                  : "No reviews yet"}
              </p>
            </div>
            {ratingSummary?.reviews?.length ? (
              <div className="mt-5 divide-y divide-border">
                {ratingSummary.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <p
                      className="text-sm text-accent"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                    </p>
                    {review.review ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text/85">
                        {review.review}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted">{review.name}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted">
                Be the first to share your experience.
              </p>
            )}
          </section>

          <section
            aria-labelledby="course-certificate-heading"
            className="mt-10 border-t border-border pt-6"
          >
            <h3
              id="course-certificate-heading"
              className="font-serif text-2xl tracking-[-0.03em]"
            >
              Earn a certificate of completion
            </h3>
            <div className="mt-5 border border-accent/50 p-1">
              <div className="border border-border bg-surface px-6 py-8 md:px-8 md:py-10">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                  SammyArts · Learning collection
                </p>
                <p className="mt-10 text-xs text-muted">
                  Certificate of completion
                </p>
                <p className="mt-2 font-serif text-3xl leading-tight tracking-[-0.03em] md:text-4xl">
                  {activeCourse.title}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                  Awarded to the learner upon successful completion of this
                  course.
                </p>
                <div className="mt-10 flex flex-wrap justify-between gap-6 border-t border-border pt-4 text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                  <span>SammyArts</span>
                  <span>Certificate of achievement</span>
                </div>
              </div>
            </div>
          </section>

          {nextCourses.length ? (
            <section
              aria-labelledby="next-course-heading"
              className="mt-10 border-t border-border pt-6"
            >
              <h3
                id="next-course-heading"
                className="font-serif text-accent text-2xl tracking-[-0.03em]"
              >
                Take this course next
              </h3>
              <ul className="mt-4 divide-y divide-border">
                {nextCourses.slice(0, 3).map((nextCourse) => (
                  <li key={nextCourse.id}>
                    <button
                      type="button"
                      onClick={() => selectCourse(nextCourse)}
                      className="group flex min-h-14 w-full items-center justify-between gap-5 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span>
                        <span className="block font-serif text-lg leading-tight transition-colors group-hover:text-accent">
                          {nextCourse.title}
                        </span>
                        <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                          {nextCourse.category}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-accent">
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="border-t border-border bg-surface px-6 py-5 md:border-l md:border-t-0 md:px-8 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Course overview
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close course details"
              className="min-h-11 border-b border-transparent pb-1 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-border hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Close
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-1">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                Level
              </dt>
              <dd className="mt-1 text-sm">
                {activeCourse.level || "All levels"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                Duration
              </dt>
              <dd className="mt-1 text-sm">
                {activeCourse.duration || "Self-paced"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                Lessons
              </dt>
              <dd className="mt-1 text-sm">
                {activeCourse.lessons
                  ? activeCourse.lessons
                  : "Details coming soon"}
              </dd>
            </div>
            {ratingSummary?.count ? (
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                  Student rating
                </dt>
                <dd className="mt-1 text-sm">
                  <span className="text-accent" aria-hidden="true">
                    ★
                  </span>{" "}
                  {ratingSummary.average.toFixed(1)} / 5
                  <span className="ml-1 text-xs text-muted">
                    ({ratingSummary.count})
                  </span>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 border-t border-border pt-5">
            <PriceTag
              price={activeCourse.price}
              billing={activeCourse.billing}
              size="lg"
            />
            <div className="mt-5">
              <BuyButton
                label={
                  activeCourse.type === "mentorship" ? "Book now" : "Buy course"
                }
                onClick={() => {
                  onClose();
                  onBuy(activeCourse);
                }}
              />
            </div>
          </div>
        </aside>
      </section>
    </div>,
    document.body,
  );
}

export default CourseDetailsModal;
