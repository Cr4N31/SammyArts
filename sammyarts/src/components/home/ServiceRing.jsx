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

const SPEED = 70; // auto-scroll speed in pixels per second
const MIN_ITEMS = 8; // each set must be wider than the stage, so short lists repeat
const MAX_FLICK = 2500; // cap on throw velocity (px/s)
const EASING = 5; // how quickly motion settles to its target speed

// Fade the left and right edges out
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)";

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
  "whitespace-nowrap font-serif text-[clamp(2.75rem,7vw,6.5rem)] leading-none tracking-[-0.045em]";

// Keep the offset inside (-width, 0] so the loop wraps seamlessly.
const wrap = (x, width) => {
  const m = x % width;
  return m > 0 ? m - width : m;
};

function ServiceRing({ readMoreHref, className = "" }) {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const velRef = useRef(-SPEED); // current velocity in px/s
  const widthRef = useRef(0);
  const hoverRef = useRef(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
    lastX: 0,
    lastT: 0,
  });

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

  const apply = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
    }
  };

  // Written straight to the DOM, so scrolling never triggers a React render.
  useAnimationFrame((_, delta) => {
    if (!trackRef.current || reduce || !inView || !widthRef.current) return;

    // While the user holds it, the pointer is in control.
    if (dragRef.current.active) return;

    const dt = Math.min(delta, 64) / 1000;

    // Ease toward the target speed: stopped while hovered, auto-scroll otherwise.
    // After a flick this also gives a natural inertia decay.
    const target = hoverRef.current ? 0 : -SPEED;
    velRef.current += (target - velRef.current) * (1 - Math.exp(-EASING * dt));

    xRef.current = wrap(xRef.current + velRef.current * dt, widthRef.current);
    apply();
  });

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startOffset: xRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
    };

    velRef.current = 0;
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag.active || !widthRef.current) return;

    const now = performance.now();
    const elapsed = Math.max(now - drag.lastT, 1);
    const instant = ((event.clientX - drag.lastX) / elapsed) * 1000;

    // Smoothed pointer velocity, used for the throw on release.
    velRef.current = Math.max(
      -MAX_FLICK,
      Math.min(MAX_FLICK, velRef.current * 0.6 + instant * 0.4),
    );

    drag.lastX = event.clientX;
    drag.lastT = now;

    xRef.current = wrap(
      drag.startOffset + (event.clientX - drag.startX),
      widthRef.current,
    );
    apply();
  };

  const endDrag = (event) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;

    // If the pointer was held still before release, don't throw.
    if (performance.now() - dragRef.current.lastT > 80) velRef.current = 0;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!services.length) return null;

  return (
    <MotionDiv
      {...fadeUp}
      transition={{ duration: 1, delay: 0.2, ease: EASE }}
      className={className}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 text-xs text-text">
        <p>We Deliver</p>
        {!reduce && (
          <p className="text-muted" aria-hidden="true">
            Drag to explore
          </p>
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
          className="mt-6 cursor-grab select-none overflow-hidden active:cursor-grabbing md:mt-10"
          style={{
            maskImage: EDGE_MASK,
            WebkitMaskImage: EDGE_MASK,
            touchAction: "pan-y", // horizontal drags move the marquee, vertical still scrolls the page
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") hoverRef.current = true;
          }}
          onPointerLeave={() => {
            hoverRef.current = false;
          }}
          onDragStart={(event) => event.preventDefault()}
        >
          {/* py keeps descenders (g, p, y) from being clipped */}
          <div
            ref={trackRef}
            aria-hidden="true"
            className="flex w-max items-center py-6 will-change-transform md:py-8"
          >
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {SET.map((service, index) => (
                  <li
                    key={`${copy}-${index}`}
                    className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
                  >
                    <span
                      className={`${itemText} transition-colors duration-300 hover:text-accent`}
                    >
                      {service.name}
                    </span>
                    <span className="size-2.5 shrink-0 rounded-full bg-accent md:size-3" />
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
