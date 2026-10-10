import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PageTransitionLink } from "../../shared/PageTransition";
import { useContent } from "../../data/content";

const EASE = [0.16, 1, 0.3, 1];
const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 80;
const FEATURED_WORKS_LIMIT = 6;
const MotionDiv = motion.div;

const Arrow = ({ direction = "right", className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
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

const NavButton = ({ side, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`absolute top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl border border-border bg-bg/80 text-accent backdrop-blur transition-colors hover:bg-accent-hover hover:text-brand active:bg-accent-pressed md:h-14 md:w-14 ${
      side === "left" ? "left-3 md:left-5" : "right-3 md:right-5"
    }`}
  >
    <Arrow direction={side} />
  </button>
);

function Portfolio() {
  const { works: allWorks } = useContent();
  const works = allWorks.slice(0, FEATURED_WORKS_LIMIT);
  const reduce = useReducedMotion();
  const total = works.length;

  // [currentIndex, direction]: 1 = moving forward, -1 = moving back
  const [[index, direction], setPage] = useState([0, 0]);
  const [paused, setPaused] = useState(false);

  const paginate = (dir) => {
    if (!total) return;
    setPage(([i]) => [(i + dir + total) % total, dir]);
  };

  const goTo = (next) =>
    setPage(([i, d]) => (next === i ? [i, d] : [next, next > i ? 1 : -1]));

  // Autoplay. Re-arms after every slide change, so a manual click resets the timer
  useEffect(() => {
    if (!total || paused || reduce) return;
    const id = setTimeout(
      () => setPage(([i]) => [(i + 1) % total, 1]),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(id);
  }, [index, paused, reduce, total]);

  const offset = reduce ? 0 : 140;
  const variants = {
    enter: (dir) => ({ x: dir >= 0 ? offset : -offset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir >= 0 ? -offset : offset, opacity: 0 }),
  };

  const safeIndex = total ? Math.min(index, total - 1) : 0;
  const item = works[safeIndex];

  if (!item) {
    return (
      <section id="gallery" className="px-5 py-20 text-text md:px-10 md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
          Gallery
        </p>
        <h2 className="font-serif text-[clamp(2.75rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.05em]">
          A few of our artistic works
        </h2>
        <p className="mt-6 text-sm text-muted">No pieces yet.</p>
      </section>
    );
  }

  return (
    <section
      id="gallery"
      className="relative overflow-hidden py-20 text-text md:py-32"
    >
      <div className="">
        {/* Header */}
        <div className="mb-10 flex px-5 md:px-10 items-end justify-between gap-6 md:mb-14">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
              Gallery
            </p>
            <h2 className="font-serif text-[clamp(2.75rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.05em]">
              A few of our artistic <span>works</span>
            </h2>
          </div>

          <p className="font-serif text-sm tabular-nums text-muted md:text-base">
            <span>{String(safeIndex + 1).padStart(2, "0")}</span> /{" "}
            {String(total).padStart(2, "0")}
          </p>
        </div>

        {/* Carousel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Portfolio gallery"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-raised ring-1 ring-border md:aspect-[16/9]">
            <AnimatePresence initial={false} custom={direction}>
              <MotionDiv
                key={item.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { duration: 0.9, ease: EASE },
                  opacity: { duration: 0.6, ease: "easeOut" },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD) paginate(1);
                  else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1);
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />

                {/* Readability gradient behind the tag */}
                <div className="absolute inset-0 bg-linear-to-t from-bg/80 via-bg/10 to-transparent" />

                {/* Title tag */}
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                  <span className="inline-flex items-center gap-2.5 border border-border bg-bg/80 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-accent backdrop-blur-sm md:px-4 md:py-2 md:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item.title}
                  </span>
                </div>
              </MotionDiv>
            </AnimatePresence>

            <NavButton
              side="left"
              label="Previous project"
              onClick={() => paginate(-1)}
            />
            <NavButton
              side="right"
              label="Next project"
              onClick={() => paginate(1)}
            />
          </div>

          {/* Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {works.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${p.title}`}
                aria-current={i === safeIndex}
                className="group py-3"
              >
                <span
                  className={`block h-px transition-all duration-500 ${
                    i === safeIndex
                      ? "w-10 bg-accent"
                      : "w-5 bg-muted/30 group-hover:bg-muted/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6 items-center flex-row">
        <PageTransitionLink
          to="/gallery"
          className="text-lg font-medium border-b border-accent text-accent transition-colors hover:text-accent-hover hover:border-accent-hover"
        >
          View more projects &rarr;
        </PageTransitionLink>
      </div>
    </section>
  );
}

export default Portfolio;
