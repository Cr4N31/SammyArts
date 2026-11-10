import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PageTransitionLink } from "../../shared/PageTransition";

const EASE = [0.16, 1, 0.3, 1]; // easeOutExpo, long soft landing
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const WORD = "Sammy";
const WORD_SUFFIX = "arts";

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
 * Wordmark. Measures itself and scales the font size so the word always
 * spans its container exactly. The container decides the width (full width
 * on mobile, about two thirds of the viewport on desktop).
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
      <h1
        ref={textRef}
        aria-label={`${WORD}${WORD_SUFFIX}`}
        className="flex w-max select-none overflow-hidden whitespace-nowrap pb-[0.2em] font-serif leading-[0.9] tracking-[-0.08em] text-text"
        style={{ fontSize: size }}
      >
        {[...WORD, ...WORD_SUFFIX].map((ch, i) => (
          <MotionSpan
            key={i}
            aria-hidden="true"
            className={`inline-block hero-wordmark pr-2 ${i >= WORD.length ? "text-accent" : ""}`}
            initial={{ y: reduce ? 0 : "130%" }}
            animate={{ y: ready || reduce ? 0 : "130%" }}
            transition={{ duration: 1.3, delay: 0.7 + i * 0.05, ease: EASE }}
          >
            {ch}
          </MotionSpan>
        ))}
      </h1>
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
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-brand text-text">
      {/*
        Landscape image. Subject sits on the right, the left is already dark,
        so the text lives there and the face is never covered.
        Desktop: full-bleed. Mobile: starts below the headline and fades in
        from the top so the crop edge never shows.
      */}
      <MotionDiv
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[30svh] z-0 [mask-image:linear-gradient(to_bottom,transparent,black_30%)] md:top-0 md:[mask-image:none]"
        initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
        style={{ transformOrigin: "80% 40%" }}
      >
        <picture>
          <source srcSet="/img/Sammyarts Studio(L).png" type="image/png" />
          <img
            src="/img/Sammyarts Studio(L).png"
            alt=""
            width="2576"
            height="1449"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            className="h-full w-full select-none object-cover object-[82%_30%] md:object-[right_center]"
          />
        </picture>
      </MotionDiv>

      {/* Soft shade at the bottom keeps the wordmark readable over the gold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[40%] bg-gradient-to-t from-brand/80 via-brand/30 to-transparent"
      />

      {/*
        Layout (desktop): everything shares one left edge, inset about 9.5vw.
        Headline sits at roughly 28% of the viewport height, the button
        right beneath it, and the wordmark in the lower third at about 68vw
        wide, so it runs over the subject's shoulder. Breathing room is
        left below it.
      */}
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-16 px-5 pb-8 pt-28 md:gap-0 md:pb-[11svh] md:pl-[9.5vw] md:pr-10 md:pt-[27svh]">
        {/* Headline + CTA, stacked on the dark left side */}
        <div className="flex flex-col items-start gap-8 md:gap-[5svh]">
          <MotionDiv {...fade(1.7)}>
            <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-text md:text-[clamp(2.25rem,3.9vw,4.5rem)]">
              Brand Designer
              <br />
              &amp; Strategist
            </h1>
          </MotionDiv>

          <MotionDiv {...fade(1.9)}>
            <PageTransitionLink
              to="/gallery"
              className="group inline-flex items-center gap-4 rounded-full bg-accent p-3 pl-4 text-sm text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              View gallery
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
            </PageTransitionLink>
          </MotionDiv>
        </div>

        {/* Wordmark: full width on mobile, about 68vw on desktop */}
        <div className="w-full md:w-[68vw]">
          <Wordmark />
        </div>
      </div>
    </section>
  );
}

export default Hero;
