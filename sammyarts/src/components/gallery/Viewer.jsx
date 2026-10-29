import { useEffect, useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useScrollReveal } from "../../shared/useScrollReveal";

const MotionDiv = motion.div;

const pad = (n) => String(n).padStart(2, "0");

const dockButton =
  "grid h-11 min-w-11 place-items-center px-3 text-text transition-colors duration-200 hover:bg-accent hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text";

const VARIANTS = ["left", "right", "full"];

function Plate({ src, alt, number, total, variant, eager }) {
  const image = (
    <figure className="bg-surface">
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="block h-auto min-h-48 w-full select-none"
      />
    </figure>
  );

  const placard = (
    <>
      <span className="font-serif text-3xl leading-none md:text-5xl">
        {pad(number)}
      </span>
      <span className="text-xs text-muted">of {pad(total)}</span>
    </>
  );

  if (variant === "hero" || variant === "full") {
    return (
      <li data-reveal className={variant === "full" ? "px-5 md:px-10" : ""}>
        {image}
        <div
          className={`mt-3 flex items-baseline gap-3 ${
            variant === "hero" ? "px-5 md:px-10" : ""
          }`}
        >
          {placard}
        </div>
      </li>
    );
  }

  const left = variant === "left";

  return (
    <li
      data-reveal
      className="px-5 md:grid md:grid-cols-12 md:items-end md:gap-x-6 md:px-10"
    >
      <div
        className={`md:row-start-1 ${
          left ? "md:col-span-8 md:col-start-1" : "md:col-span-7 md:col-start-6"
        }`}
      >
        {image}
      </div>

      <div
        className={`mt-3 flex items-baseline gap-3 md:row-start-1 md:mt-0 md:pb-1 ${
          left ? "md:col-span-4 md:col-start-9" : "md:col-span-4 md:col-start-1"
        }`}
      >
        {placard}
      </div>
    </li>
  );
}

function Viewer({ works, open, index, onClose, onStep }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const reduce = useReducedMotion();
  const work = works[index];

  // Reset the scroll position when opening or switching projects.
  useLayoutEffect(() => {
    if (!open || !scrollRef.current) return;

    scrollRef.current.scrollTop = 0;
  }, [work?.id, open]);

  // Reveal plates as they enter the scroll container.
  useScrollReveal(scrollRef, {
    enabled: open && !reduce,
    watch: open ? work?.id : "closed",
  });

  // Lock background scrolling and manage focus.
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

  // Keyboard navigation and focus trapping.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (works.length > 1) {
        if (e.key === "ArrowRight") {
          onStep(1);
          return;
        }

        if (e.key === "ArrowLeft") {
          onStep(-1);
          return;
        }
      }

      if (e.key !== "Tab") return;

      const nodes = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );

      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onStep, works.length]);

  if (!work) return null;

  const images = [
    ...new Set([work.img, ...(work.caseStudyImages || [])]),
  ].filter(Boolean);

  const meta = [
    ["Client", work.client],
    ["Discipline", work.category],
    ["Medium", work.medium],
    ["Year", work.year],
  ].filter(([, value]) => value);

  const others = [1, 2, 3]
    .map((delta) => ({
      delta,
      item: works[(index + delta) % works.length],
    }))
    .filter(
      ({ item }, i, all) =>
        item &&
        item.id !== work.id &&
        all.findIndex((other) => other.item.id === item.id) === i,
    );

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          key="viewer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={[work.title, work.medium, work.year]
            .filter(Boolean)
            .join(", ")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] h-dvh overflow-hidden bg-brand text-text"
        >
          {/* Top-right floating controls */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end px-5 pt-5 md:px-10 md:pt-8">
            <div className="pointer-events-auto flex divide-x divide-border border border-border bg-brand">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label="Previous project"
                className={dockButton}
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

              <p
                aria-live="polite"
                className="grid h-11 place-items-center px-4 text-xs tabular-nums text-muted"
              >
                <span>
                  <span className="sr-only">Project </span>
                  {pad(index + 1)} / {pad(works.length)}
                </span>
              </p>

              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label="Next project"
                className={dockButton}
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

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className={`${dockButton} group gap-2 px-4`}
              >
                <span className="text-sm">Close</span>
              </button>
            </div>
          </div>

          {/* Scrollable case study with hidden scrollbar */}
          <div
            ref={scrollRef}
            className="viewer-scrollbar-hidden absolute inset-0 z-0 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
            onWheel={(event) => {
              const container = event.currentTarget;

              if (container.scrollHeight <= container.clientHeight) {
                return;
              }

              // Preserve native trackpad gestures while handling mouse wheels.
              if (Math.abs(event.deltaY) > 0) {
                event.preventDefault();
                container.scrollTop += event.deltaY;
              }
            }}
          >
            <MotionDiv
              key={work.id}
              initial={{ opacity: reduce ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Title and project facts */}
              <header className="px-5 pt-24 md:px-10 md:pt-32">
                <h2 className="break-words text-balance font-serif text-[clamp(3rem,10vw,10rem)] leading-[0.88] tracking-[-0.05em]">
                  {work.title}
                </h2>

                {meta.length > 0 && (
                  <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-5 md:mt-14 md:grid-cols-4">
                    {meta.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted">{label}</dt>
                        <dd className="mt-1 font-serif text-xl leading-tight md:text-2xl">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="mt-10 whitespace-pre-line text-base leading-relaxed text-muted md:ml-[58.333%] md:mt-14 md:max-w-xl md:text-lg">
                  {work.desc ||
                    "No statement. The work will have to speak for itself."}
                </p>
              </header>

              {/* Gallery plates */}
              <div className="mt-16 md:mt-24">
                {images.length ? (
                  <ol
                    aria-label="Case study images"
                    className="flex flex-col gap-16 md:gap-28"
                  >
                    {images.map((src, i) => (
                      <Plate
                        key={`${work.id}-${src}`}
                        src={src}
                        alt={`${work.title} case study image ${i + 1}`}
                        number={i + 1}
                        total={images.length}
                        variant={
                          i === 0 ? "hero" : VARIANTS[(i - 1) % VARIANTS.length]
                        }
                        eager={i === 0}
                      />
                    ))}
                  </ol>
                ) : (
                  <div className="mx-5 grid min-h-64 place-items-center border border-dashed border-border text-sm text-muted md:mx-10">
                    Nothing to look at yet.
                  </div>
                )}
              </div>

              {/* Other projects */}
              {others.length > 0 && (
                <footer className="mt-28 px-5 pb-16 md:mt-44 md:px-10 md:pb-20">
                  <div className="flex items-baseline justify-between gap-4 border-t border-border pt-5">
                    <h3 className="font-serif text-2xl md:text-3xl">
                      Still not convinced?
                    </h3>
                    <p className="text-xs tabular-nums text-muted">
                      {works.length} projects
                    </p>
                  </div>

                  <ul className="mt-8 grid grid-cols-3 gap-3 md:gap-6">
                    {others.map(({ delta, item }) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onStep(delta)}
                          className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                        >
                          <span className="block aspect-[4/5] overflow-hidden bg-surface">
                            <img
                              src={item.img}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              draggable={false}
                              className="h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            />
                          </span>

                          <span className="mt-3 flex items-baseline justify-between gap-3">
                            <span className="truncate font-serif text-base md:text-lg">
                              {item.title}
                            </span>

                            {item.year ? (
                              <span className="shrink-0 text-xs text-muted">
                                {item.year}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </footer>
              )}
            </MotionDiv>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

export default Viewer;
