import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1]; // easeOutExpo, long soft landing
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const WORD = "Sammyarts";

const ArrowRight = ({ className = "h-4 w-4" }) => (
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
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Full-width wordmark. Measures itself and scales the font size so the word
 * always spans the container exactly, on any screen width.
 * Letters rise out of a clipped line on load (the one orchestrated moment).
 */
const Wordmark = () => {
  const reduce = useReducedMotion();
  const boxRef = useRef(null);
  const textRef = useRef(null);
  const [size, setSize] = useState(100);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    const fit = () => {
      const current = parseFloat(getComputedStyle(el).fontSize);
      const width = el.getBoundingClientRect().width;
      if (!width || !box.clientWidth) return;
      const next = (current * box.clientWidth) / width;
      if (Math.abs(next - current) > 0.5) setSize(next);
      setReady(true);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    // Re-measure once the serif font has actually loaded
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className="w-full"
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      <p
        ref={textRef}
        aria-label={WORD}
        className="flex w-max select-none overflow-hidden whitespace-nowrap pb-[0.2em] font-serif leading-[0.9] tracking-[-0.04em] text-text"
        style={{ fontSize: size }}
      >
        {WORD.split("").map((ch, i) => (
          <MotionSpan
            key={i}
            aria-hidden="true"
            className="inline-block"
            initial={{ y: reduce ? 0 : "130%" }}
            animate={{ y: ready || reduce ? 0 : "130%" }}
            transition={{ duration: 1.3, delay: 0.7 + i * 0.05, ease: EASE }}
          >
            {ch}
          </MotionSpan>
        ))}
      </p>
    </div>
  );
};

function Hero() {
  const reduce = useReducedMotion();

  // Supporting content simply fades in after the wordmark has landed
  const fade = (delay) => ({
    initial: { opacity: reduce ? 1 : 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.9, delay: reduce ? 0 : delay, ease: "easeOut" },
  });

  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-brand pb-12 text-text">
      {/* Portrait: centered, anchored to the bottom, sits behind all text */}
      <MotionDiv
        aria-hidden="true"
        className="pointer-events-none top-10 absolute inset-x-0 bottom-0 z-0 flex justify-center"
        style={{ transformOrigin: "50% 100%" }}
        initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <picture>
          <source srcSet="/img/ceo-cutout.webp" type="image/webp" />
          <img
            src="/img/ceo-cutout.png"
            alt=""
            width="1024"
            height="1536"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            className="h-[78svh] w-auto max-w-none select-none object-contain md:h-[130svh]"
          />
        </picture>
      </MotionDiv>

      <div className="relative z-10 flex flex-1 flex-col justify-end gap-10 px-5 pb-4 pt-28 md:gap-14 md:px-10 md:pb-6">
        {/* Headline + CTA row */}
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <MotionDiv
            {...fade(1.7)}
            className="flex flex-col items-start gap-5 md:max-w-[44%]"
          >
            <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-text md:text-[clamp(2.25rem,4vw,3.75rem)]">
              Brand &amp; UI/UX Designer based in Nigeria
            </h1>
          </MotionDiv>

          <MotionDiv {...fade(1.9)}>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-4 rounded-full bg-accent p-1.5 pr-7 text-sm text-brand transition-colors duration-300 hover:bg-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-text text-brand transition-colors duration-300 group-hover:bg-accent">
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
              </span>
              View gallery
            </Link>
          </MotionDiv>
        </div>

        <Wordmark />
      </div>
    </section>
  );
}

export default Hero;
