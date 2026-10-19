import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

const MotionDiv = motion.div;
const iconButtonClass =
  "grid h-11 w-11 shrink-0 place-items-center border border-border text-text transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40";

function Viewer({ works, open, index, onClose, onStep }) {
  const closeRef = useRef(null);
  const work = works[index];

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!work) return null;

  const images = [...new Set([work.img, ...(work.caseStudyImages || [])])].filter(
    Boolean,
  );

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          key="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title}, ${work.medium}, ${work.year}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] grid h-dvh grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-brand text-cream md:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)] md:grid-rows-1"
        >
          <section
            role="region"
            aria-label={`${work.title} case study images`}
            className="min-h-0 overflow-y-auto overscroll-contain bg-surface"
          >
            <div className="mx-auto flex max-w-5xl flex-col gap-3 p-3 sm:gap-5 sm:p-5 md:gap-6 md:p-8">
              {images.length ? (
                images.map((src, imageIndex) => (
                  <img
                    key={`${work.id}-${src}`}
                    src={src}
                    alt={`${work.title} case study image ${imageIndex + 1}`}
                    loading={imageIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className="block h-auto w-full select-none object-contain"
                  />
                ))
              ) : (
                <div className="grid min-h-64 place-items-center border border-dashed border-border text-sm text-muted">
                  No case study images added yet.
                </div>
              )}
            </div>
          </section>

          <aside className="relative z-10 flex max-h-[50svh] min-h-0 flex-col border-t border-border bg-bg px-5 py-4 sm:px-8 md:h-dvh md:max-h-none md:border-l md:border-t-0 md:px-10 md:py-8">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Project {String(index + 1).padStart(2, "0")} /{" "}
                {String(works.length).padStart(2, "0")}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close project case study"
                className={iconButtonClass}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-6 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">
                Case study
              </p>
              <h2 className="mt-4 break-words font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em]">
                {work.title}
              </h2>
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted">
                {work.desc || "More details about this project are coming soon."}
              </p>

              <dl className="mt-8 border-t border-border">
                <div className="flex items-center justify-between gap-4 border-b border-border py-4">
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                    Tag
                  </dt>
                  <dd className="border border-border px-2.5 py-1 text-right text-xs uppercase tracking-[0.12em] text-accent">
                    {work.category || "Uncategorized"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border py-4">
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                    Year
                  </dt>
                  <dd className="text-right text-sm">{work.year || "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label="Previous project"
                className={iconButtonClass}
                disabled={works.length < 2}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M19 12H5m6 6-6-6 6-6" />
                </svg>
              </button>
              <p className="text-xs text-muted">Browse projects</p>
              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label="Next project"
                className={iconButtonClass}
                disabled={works.length < 2}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </aside>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

export default Viewer;
