import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

const MotionDiv = motion.div;
const MotionImg = motion.img;
const SWIPE = 80;

const Arrow = ({ direction }) => (
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
    <path
      d={
        direction === "right"
          ? "M5 12h14M13 6l6 6-6 6"
          : "M19 12H5M11 6l-6 6 6 6"
      }
    />
  </svg>
);

const stepButton =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/40 text-accent transition-colors duration-300 hover:bg-accent hover:text-brand";

// Full screen viewer. Arrow keys and swipe move between works, Escape closes.
function Viewer({ works, open, index, onClose, onStep }) {
  const closeRef = useRef(null);
  const work = works[index];

  // Lock page scroll, move focus in, and give it back on close
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
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onStep]);

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
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] flex flex-col bg-brand/95 text-cream backdrop-blur-sm"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
            <p className="text-xs text-cream/60">
              {String(index + 1).padStart(2, "0")} of {works.length}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-full border border-accent/40 px-5 py-2 text-xs text-accent transition-colors duration-300 hover:bg-accent hover:text-brand"
            >
              Close
            </button>
          </div>

          {/* Work */}
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 md:px-16">
            <AnimatePresence mode="wait" initial={false}>
              <MotionImg
                key={work.id}
                src={work.img}
                alt={work.title}
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE) onStep(1);
                  else if (info.offset.x > SWIPE) onStep(-1);
                }}
                className="max-h-[68svh] max-w-full cursor-grab select-none object-contain active:cursor-grabbing"
              />
            </AnimatePresence>
          </div>

          {/* Details and controls */}
          <div className="flex items-center justify-between gap-4 px-5 py-6 md:px-10 md:py-8">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Previous work"
              className={stepButton}
            >
              <Arrow direction="left" />
            </button>

            <div className="text-center">
              <p className="font-serif text-2xl italic leading-tight tracking-[-0.02em] md:text-3xl">
                {work.title}
              </p>
              <p className="mt-1 text-xs text-cream/60">
                {work.medium}, {work.year}
                {work.room ? `, ${work.room}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Next work"
              className={stepButton}
            >
              <Arrow direction="right" />
            </button>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

export default Viewer;
