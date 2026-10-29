import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useReducedMotion,
} from "motion/react";
import { services } from "../../data/service";

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

const SPEED = 60; // pixels per second
const MIN_ITEMS = 8; // each set must be wider than the stage, so short lists repeat

// Fade the left and right edges out
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

// One loop "set": the services list repeated until it is wide enough to fill
// the stage, so the seam of the loop is never visible.
const SET = services.length
  ? Array.from(
      { length: Math.ceil(MIN_ITEMS / services.length) },
      () => services,
    ).flat()
  : [];

const itemText =
  "whitespace-nowrap font-serif text-[clamp(2.25rem,5.5vw,5rem)] leading-none tracking-[-0.04em]";

function ServiceRing({ readMoreHref, className = "" }) {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const widthRef = useRef(0);
  const pausedRef = useRef(false);

  const inView = useInView(stageRef, { margin: "100px" });
  const reduce = useReducedMotion();

  // Measure one full set so the loop wraps without a jump.
  useEffect(() => {
    const track = trackRef.current;

    if (!track) return undefined;

    if (reduce) {
      track.style.transform = "";
      return undefined;
    }

    const measure = () => {
      widthRef.current = track.scrollWidth / 2;
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => observer.disconnect();
  }, [reduce]);

  // Written straight to the DOM, so scrolling never triggers a React render.
  useAnimationFrame((_, delta) => {
    const track = trackRef.current;

    if (!track || reduce || !inView || pausedRef.current || !widthRef.current) {
      return;
    }

    const dt = Math.min(delta, 64);

    xRef.current = (xRef.current - (SPEED * dt) / 1000) % widthRef.current;
    track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
  });

  if (!services.length) return null;

  return (
    <MotionDiv
      {...fadeUp}
      transition={{ duration: 1, delay: 0.2, ease: EASE }}
      className={className}
    >
      {/* Header row */}
      <div className="flex items-center justify-between text-xs text-text">
        <p>We Deliver</p>

        {readMoreHref && (
          <a
            href={readMoreHref}
            className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-accent"
          >
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-current"
            />
            Read More
          </a>
        )}
      </div>

      {reduce ? (
        // Reduced motion: a plain, static list instead of a moving track
        <ul className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 md:mt-14">
          {services.map((service) => (
            <li key={service.name} className={itemText}>
              {service.name}
            </li>
          ))}
        </ul>
      ) : (
        <div
          ref={stageRef}
          role="img"
          aria-label={`Our services: ${services.map((s) => s.name).join(", ")}`}
          className="mt-6 select-none overflow-hidden md:mt-10"
          style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") pausedRef.current = true;
          }}
          onPointerLeave={() => {
            pausedRef.current = false;
          }}
        >
          {/* py-4 keeps descenders (g, p, y) from being clipped */}
          <div
            ref={trackRef}
            aria-hidden="true"
            className="flex w-max items-center py-4 will-change-transform"
          >
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {SET.map((service, index) => (
                  <li
                    key={`${copy}-${index}`}
                    className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
                  >
                    <span className={itemText}>{service.name}</span>
                    <span className="size-2 shrink-0 rounded-full bg-accent" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </MotionDiv>
  );
}

export default ServiceRing;
