import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1];
const AUTO_SPEED = 50;
const SCROLL_SMOOTHING_MS = 100;

const MotionP = motion.p;
const MotionH2 = motion.h2;
const MotionDiv = motion.div;

const confessions = [
  {
    quote:
      "We loved working with the team. They took the time to really understand who we are and brought our vision to life in a way we never imagined.",
    name: "Ashley Warren",
    role: "Director of Enrollment",
    width: "w-72 md:w-[26rem]",
    rotate: -3,
    offset: 0,
  },
  {
    quote:
      "Wildly creative and professional in all the right ways. The whole process was fun and effortless, and the result finally feels like us.",
    name: "Ryan Keisel",
    role: "Elevate, CEO",
    width: "w-72 md:w-[24rem]",
    rotate: 2,
    offset: 56,
  },
  {
    quote:
      "Since launching, visitors are spending over two minutes on every page and enquiries have doubled.",
    name: "Yuri Pereira",
    role: "Hugo, Marketing and Growth",
    width: "w-64 md:w-[22rem]",
    rotate: -2,
    offset: 16,
  },
  {
    quote:
      "We went from a handful of clients to thousands within a year of launching our new brand and website.",
    name: "Matan Slagter",
    role: "Armadillo, CEO",
    width: "w-72 md:w-[25rem]",
    rotate: 3,
    offset: 72,
  },
  {
    quote:
      "The best creative team we have worked with. Their work brought more credibility to our long term goal of building a community.",
    name: "Dana Okafor",
    role: "Dogelon, Founder",
    width: "w-72 md:w-[23rem]",
    rotate: -1.5,
    offset: 0,
  },
  {
    quote:
      "Honest feedback, beautiful execution, and a team that genuinely cares about the outcome.",
    name: "Tobi Adeyemi",
    role: "Studio Nine, Creative Lead",
    width: "w-64 md:w-[22rem]",
    rotate: 2.5,
    offset: 48,
  },
];

// Cards no longer manage the cursor. The carousel viewport tracks the pointer
// as a whole, so the cursor cannot flicker when the pointer crosses the gaps
// between cards or when cards drift underneath a stationary mouse.
const ConfessionCard = ({ item, index }) => {
  const dark = index % 2 === 0;

  return (
    <motion.li
      onDragStart={(event) => event.preventDefault()}
      whileHover={{
        scale: 1.035,
        y: -9,
      }}
      transition={{
        scale: { duration: 0.3, ease: EASE },
        y: { duration: 0.3, ease: EASE },
      }}
      className={`relative z-0 shrink-0 select-none rounded-sm border border-border px-8 pb-12 pt-14 text-center shadow-lg ${
        item.width
      } ${dark ? "bg-surface text-text" : "bg-raised text-text"}`}
      style={{
        rotate: item.rotate,
        marginTop: item.offset,
        transformOrigin: "center center",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute select-none font-serif text-7xl leading-none text-accent ${
          dark ? "right-5 top-3" : "bottom-1 left-5"
        }`}
      >
        {dark ? "\u201D" : "\u201C"}
      </span>

      <p className="select-none text-base leading-snug md:text-lg">
        {item.quote}
      </p>

      <div className="mt-8 select-none">
        <p className="text-xs font-bold">{item.name}</p>
        <p className="mt-1 text-xs text-muted">{item.role}</p>
      </div>
    </motion.li>
  );
};

function Confessions() {
  const reduce = useReducedMotion();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const inViewRef = useRef(false);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef(0);
  const setWidthRef = useRef(0);
  const pendingRef = useRef(0);
  const lastScrollRef = useRef(0);
  const activePointerRef = useRef(null);

  // "hovering" means a mouse is over the carousel. It is separate from
  // dragging, so the cursor comes back correctly after a drag ends.
  const [hovering, setHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const smoothCursorX = useSpring(cursorX, {
    stiffness: 500,
    damping: 38,
    mass: 0.35,
  });

  const smoothCursorY = useSpring(cursorY, {
    stiffness: 500,
    damping: 38,
    mass: 0.35,
  });

  const { scrollY } = useScroll();
  const x = useMotionValue(0);

  const wrappedX = useTransform(x, (value) => {
    const width = setWidthRef.current;

    return width ? (((value % width) + width) % width) - width : 0;
  });

  // Track visibility so the animation pauses outside the viewport.
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    lastScrollRef.current = window.scrollY;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Measure one complete set of cards for seamless looping.
  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    const measure = () => {
      setWidthRef.current = track.scrollWidth / 2;
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => observer.disconnect();
  }, []);

  // Automatic drift and smoothed page-scroll response.
  // Automatic motion continues while the user drags.
  useAnimationFrame((_, delta) => {
    const currentScroll = scrollY.get();
    const scrollDelta = currentScroll - lastScrollRef.current;

    lastScrollRef.current = currentScroll;

    if (reduce || !inViewRef.current) {
      pendingRef.current = 0;
      return;
    }

    const dt = Math.min(delta, 64);

    pendingRef.current += scrollDelta;

    const share = 1 - Math.exp(-dt / SCROLL_SMOOTHING_MS);
    const scrollStep = pendingRef.current * share;

    pendingRef.current -= scrollStep;

    x.set(x.get() - (AUTO_SPEED * dt) / 1000 - scrollStep);
  });

  // Cursor tracking (mouse only, never touch or pen).
  const handlePointerEnter = (event) => {
    if (reduce || event.pointerType !== "mouse") return;

    // Snap the spring to the pointer first so the cursor appears in place
    // instead of flying in from wherever it was last.
    smoothCursorX.jump?.(event.clientX);
    smoothCursorY.jump?.(event.clientY);
    cursorX.set(event.clientX);
    cursorY.set(event.clientY);

    setHovering(true);
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType !== "mouse") return;

    setHovering(false);
  };

  // Start mouse dragging or touch swiping.
  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    // Prevent native text selection and image dragging on desktop.
    if (event.pointerType === "mouse") {
      event.preventDefault();
    }

    draggingRef.current = true;
    activePointerRef.current = event.pointerId;
    lastPointerRef.current = event.clientX;

    setIsDragging(true);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may be unavailable in some environments.
    }
  };

  // One move handler drives both the cursor and the drag.
  const handlePointerMove = (event) => {
    if (!reduce && event.pointerType === "mouse") {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      setHovering(true);
    }

    if (!draggingRef.current || activePointerRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - lastPointerRef.current;

    lastPointerRef.current = event.clientX;

    x.set(x.get() + deltaX);
  };

  const finishDragging = (event) => {
    if (
      activePointerRef.current !== null &&
      event.pointerId !== undefined &&
      activePointerRef.current !== event.pointerId
    ) {
      return;
    }

    draggingRef.current = false;
    activePointerRef.current = null;

    setIsDragging(false);
  };

  const handlePointerUp = (event) => {
    finishDragging(event);

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const showCursor = hovering && !reduce;

  const cursor = (
    <MotionDiv
      aria-hidden="true"
      // Negative margins centre the 48px circle on the pointer. Do not use
      // translateX/translateY here: motion treats them as the same transform
      // as x/y, so they would overwrite the spring position.
      className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-6 -mt-6 hidden items-center justify-center md:flex"
      style={{ x: smoothCursorX, y: smoothCursorY }}
      initial={false}
      animate={{
        opacity: showCursor ? 1 : 0,
        scale: !showCursor ? 0.6 : isDragging ? 0.85 : 1,
      }}
      transition={{
        opacity: { duration: 0.18 },
        scale: { duration: 0.22, ease: EASE },
      }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#120d0d] text-xl shadow-xl backdrop-blur-md">
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="white"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10 4.5a1.5 1.5 0 0 1 3 0V10 6a1.5 1.5 0 0 1 3 0v6-1a1.5 1.5 0 0 1 3 0v4.2c0 3.2-2.5 5.8-5.7 5.8h-2.1a5.6 5.6 0 0 1-4.4-2.1l-3-3.8a1.7 1.7 0 0 1 2.6-2.2L8 15" />
        </svg>
      </div>
    </MotionDiv>
  );

  return (
    <section
      ref={sectionRef}
      id="confessions"
      className="relative overflow-hidden py-24 text-text md:py-32"
    >
      {/* Header */}
      <div className="mb-14 px-5 md:mb-20 md:px-10">
        <MotionP
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: EASE }}
          className="mb-4 text-xs uppercase tracking-[0.3em] text-muted"
        >
          Confessions
        </MotionP>

        <MotionH2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          className="font-serif text-[clamp(3.5rem,4vw,7rem)] italic leading-[0.95] tracking-[-0.05em]"
        >
          Words from the people we have worked with
        </MotionH2>
      </div>

      {/* Draggable carousel */}
      <div
        className={`relative select-none ${
          reduce
            ? "overflow-x-auto"
            : `overflow-hidden md:cursor-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`
        }`}
        style={{
          touchAction: "pan-y",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onPointerEnter={reduce ? undefined : handlePointerEnter}
        onPointerLeave={reduce ? undefined : handlePointerLeave}
        onPointerDown={reduce ? undefined : handlePointerDown}
        onPointerMove={reduce ? undefined : handlePointerMove}
        onPointerUp={reduce ? undefined : handlePointerUp}
        onPointerCancel={finishDragging}
        onLostPointerCapture={finishDragging}
        onDragStart={(event) => event.preventDefault()}
      >
        {/*
          Top padding (pt-*) gives rotated, scaled and hovered cards room above
          them so the overflow-hidden viewport no longer crops their top edge.
        */}
        <MotionDiv
          ref={trackRef}
          style={reduce ? undefined : { x: wrappedX }}
          className="flex w-max select-none items-start pb-16 pt-12 will-change-transform md:pt-16"
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 select-none items-start gap-6 pr-6 md:gap-8 md:pr-8"
            >
              {confessions.map((item, index) => (
                <ConfessionCard
                  key={`${copy}-${item.name}`}
                  item={item}
                  index={index}
                />
              ))}
            </ul>
          ))}
        </MotionDiv>
      </div>

      {/* Custom cursor, portalled to body so a transformed ancestor can never
          break position: fixed. */}
      {typeof document !== "undefined"
        ? createPortal(cursor, document.body)
        : null}
    </section>
  );
}

export default Confessions;
