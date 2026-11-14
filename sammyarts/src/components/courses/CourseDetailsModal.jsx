import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaBookOpen, FaClock, FaLayerGroup } from "react-icons/fa";
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
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-brand/80 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-details-title"
        ref={dialogRef}
        className="grid max-h-[calc(100dvh-1rem)] w-full max-w-7xl grid-cols-1 grid-rows-[auto_auto] overflow-y-auto rounded-3xl bg-bg text-text shadow-2xl md:h-[min(52rem,calc(100dvh-2rem))] md:grid-cols-[minmax(0,1fr)_24rem] md:grid-rows-1 md:overflow-hidden"
      >
        <div
          ref={contentRef}
          data-lenis-prevent
          className="px-5 py-6 sm:px-8 sm:py-8 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-12 md:py-12"
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
            <div className="relative mt-5 aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-2xl border border-accent/50 bg-[#f7f0df] p-3 sm:p-5">
              {activeCourse.certificateImage ? (
                <img
                  src={activeCourse.certificateImage}
                  alt={`${activeCourse.title} certificate of completion`}
                  className="h-full w-full rounded-xl object-contain"
                  loading="lazy"
                />
              ) : (
                <div
                  aria-label={`Certificate of completion for ${activeCourse.title}`}
                  className="relative flex h-full flex-col items-center justify-center border border-[#b39b67] px-4 text-center text-[#382f25] sm:px-8"
                >
                  <span className="font-serif text-xs uppercase tracking-[0.3em] text-[#927747] sm:text-sm">
                    SammyArts
                  </span>
                  <span className="mt-3 h-px w-2/3 bg-[#b39b67]" />
                  <p className="mt-4 font-serif text-[clamp(1.25rem,4vw,2.5rem)] leading-tight">
                    Certificate of Completion
                  </p>
                  <p className="mt-2 text-[0.55rem] uppercase tracking-[0.15em] text-[#75674f] sm:text-xs">
                    This certifies that
                  </p>
                  <p className="mt-2 max-w-full truncate font-serif text-base sm:text-xl">
                    Your Name
                  </p>
                  <p className="mt-2 line-clamp-1 max-w-full text-[0.6rem] text-[#75674f] sm:text-xs">
                    has completed {activeCourse.title}
                  </p>
                  <span className="mt-4 h-px w-1/3 bg-[#b39b67]" />
                </div>
              )}
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

        <aside className="rounded-b-3xl border-t border-border bg-surface px-5 py-5 sm:px-8 md:rounded-b-none md:rounded-r-3xl md:border-l md:border-t-0 md:px-8 md:py-10">
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
              <dt className="flex items-center gap-3 text-sm text-muted">
                <FaLayerGroup
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                />
                <span>Level</span>
              </dt>
              <dd className="ml-6 mt-1 text-sm">
                {activeCourse.level || "All levels"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-3 text-sm text-muted">
                <FaClock aria-hidden="true" className="shrink-0 text-accent" />
                <span>Duration</span>
              </dt>
              <dd className="ml-6 mt-1 text-sm">
                {activeCourse.duration || "Self-paced"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-3 text-sm text-muted">
                <FaBookOpen
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                />
                <span>Lessons</span>
              </dt>
              <dd className="ml-6 mt-1 text-sm">
                {activeCourse.lessons
                  ? activeCourse.lessons
                  : "Details coming soon"}
              </dd>
            </div>
            {ratingSummary?.count ? (
              <div>
                <dt className="text-[0.65rem] tracking-[0.14em] text-muted">
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
