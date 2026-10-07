import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1];
const AUTO_SPEED = 50; // px per second, drift when idle
const SCROLL_SMOOTHING_MS = 100; // higher = softer response to scroll
const MotionP = motion.p;
const MotionH2 = motion.h2;
const MotionDiv = motion.div;

// Placeholder copy. Keep an EVEN number of cards so the colors keep
// alternating across the loop seam.
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

const ConfessionCard = ({ item, index }) => {
  const dark = index % 2 === 0;

  return (
    <li
      className={`relative shrink-0 rounded-sm border border-border px-8 pb-12 pt-14 text-center shadow-lg ${item.width} ${
        dark ? "bg-surface text-text" : "bg-raised text-text"
      }`}
      style={{
        transform: `rotate(${item.rotate}deg)`,
        marginTop: item.offset,
      }}
    >
      <span
        aria-hidden="true"
        className={`absolute font-serif text-7xl leading-none text-accent ${
          dark ? "right-5 top-3" : "bottom-1 left-5"
        }`}
      >
        {dark ? "\u201D" : "\u201C"}
      </span>

      <p className="text-base leading-snug md:text-lg">{item.quote}</p>

      <div className="mt-8">
        <p className="text-xs font-bold">{item.name}</p>
        <p className="mt-1 text-xs text-muted">{item.role}</p>
      </div>
    </li>
  );
};

function Confessions() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const inViewRef = useRef(false);
  const hoveredRef = useRef(false);
  const setWidthRef = useRef(0);
  const pendingRef = useRef(0);
  const lastScrollRef = useRef(0);
  const speedRef = useRef(AUTO_SPEED);

  const { scrollY } = useScroll();
  const x = useMotionValue(0);

  // Wraps the position so the loop never runs out of cards
  const wrappedX = useTransform(x, (v) => {
    const w = setWidthRef.current;
    return w ? (((v % w) + w) % w) - w : 0;
  });

  // Track whether the section is on screen
  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  // Measure one full set of cards (the track holds two identical sets)
  useEffect(() => {
    const track = trackRef.current;
    const measure = () => {
      setWidthRef.current = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const y = scrollY.get();
    const dy = y - lastScrollRef.current;
    lastScrollRef.current = y;

    // Out of view: do nothing, and drop any queued scroll distance
    if (reduce || !inViewRef.current) {
      pendingRef.current = 0;
      return;
    }

    const dt = Math.min(delta, 64);

    // Idle drift, eased to a stop while hovering
    const target = hoveredRef.current ? 0 : AUTO_SPEED;
    speedRef.current += (target - speedRef.current) * Math.min(1, dt / 200);

    // Scroll distance is applied 1:1, spread over a few frames for smoothness
    pendingRef.current += dy;
    const share = 1 - Math.exp(-dt / SCROLL_SMOOTHING_MS);
    const scrollStep = pendingRef.current * share;
    pendingRef.current -= scrollStep;

    x.set(x.get() - (speedRef.current * dt) / 1000 - scrollStep);
  });

  return (
    <section
      ref={sectionRef}
      id="confessions"
      className="relative overflow-hidden py-24 text-text md:py-32"
    >
      {/* Header */}
      <div className="mx-auto mb-14 max-w-6xl px-5 md:mb-20 md:px-10">
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
          className="font-serif text-[clamp(2.75rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.05em]"
        >
          Words from the people we have worked with
        </MotionH2>
      </div>

      {/* Carousel */}
      <div
        className={reduce ? "overflow-x-auto" : "overflow-hidden"}
        onMouseEnter={() => (hoveredRef.current = true)}
        onMouseLeave={() => (hoveredRef.current = false)}
      >
        <MotionDiv
          ref={trackRef}
          style={reduce ? undefined : { x: wrappedX }}
          className="flex w-max pb-16 will-change-transform"
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-start gap-6 pr-6 md:gap-8 md:pr-8"
            >
              {confessions.map((item, i) => (
                <ConfessionCard key={item.name} item={item} index={i} />
              ))}
            </ul>
          ))}
        </MotionDiv>
      </div>
    </section>
  );
}

export default Confessions;
