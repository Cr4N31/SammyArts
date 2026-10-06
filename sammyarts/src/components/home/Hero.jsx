import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import heroImage from "/img/hero-bg.jpg";

const EASE = [0.16, 1, 0.3, 1]; // easeOutExpo, long soft landing

const ArrowDown = ({ className = "w-4 h-4" }) => (
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
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

// Swap this for an <img className="w-full h-full object-cover" /> when you have the images
const ImagePlaceholder = ({ label, className = "" }) => (
  <div
    className={`grid place-items-center border border-dashed border-accent/40 bg-accent/10 text-xs text-accent/70 ${className}`}
  >
    {label}
  </div>
);

/**
 * Wraps any asset with:
 *  - outer layer: moves up as you scroll (speed = how many px it travels)
 *  - inner layer: fades up on load (delay = stagger)
 */
const Item = ({
  children,
  progress,
  speed = 80,
  delay = 0,
  className = "",
}) => {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : -speed]);

  return (
    <motion.div
      style={{ y, willChange: "transform" }}
      className={`transform-gpu ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.8, delay, ease: "easeOut" },
          y: { duration: 1.4, delay, ease: EASE },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Smooths out wheel steps and fast flicks on touch
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
    restDelta: 0.0005,
  });

  return (
    <section
      ref={ref}
      className="relative p-6 isolate min-h-screen overflow-hidden bg-brand text-cream"
    >
      {/* Background */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-brand/85" />
      {/* Soft accent glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(247,142,72,0.18),transparent)]" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between gap-10 px-5 py-6 md:px-10 md:py-10">
        {/* Top row: images */}
        <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 md:gap-6">
          {/* Center image (first on mobile) */}
          <Item
            progress={smoothProgress}
            speed={50}
            delay={0.1}
            className="order-1 col-span-2 mx-auto w-full max-w-sm md:order-2 md:col-span-1 md:max-w-md"
          >
            <ImagePlaceholder
              label="Main image"
              className="aspect-[4/5] w-full"
            />
          </Item>

          {/* Left image + blurb */}
          <div className="order-2 md:order-1 md:max-w-[240px]">
            <Item progress={smoothProgress} speed={90} delay={0.2}>
              <ImagePlaceholder
                label="Image 2"
                className="aspect-[4/3] w-full"
              />
            </Item>
            <Item progress={smoothProgress} speed={110} delay={0.3}>
              <p className="mt-4 text-left text-xs leading-relaxed text-white/70">
                Discover exclusive, hand-crafted pieces shaped from raw
                materials and deep intention only at SammyArts' annual showcase.
              </p>
            </Item>
          </div>

          {/* Right image + scroll hint */}
          <div className="order-3 flex flex-col md:items-end md:justify-between md:gap-24">
            <Item progress={smoothProgress} speed={130} delay={0.25}>
              <ImagePlaceholder
                label="Image 3"
                className="aspect-[4/3] w-full md:aspect-square md:w-48"
              />
            </Item>
            <Item
              progress={smoothProgress}
              speed={80}
              delay={0.45}
              className="hidden md:block"
            ></Item>
          </div>
        </div>

        {/* Bottom row: title */}
        <div className="relative z-20 flex flex-col gap-6 md:-mt-24 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6 md:gap-10">
            <Item progress={smoothProgress} speed={70} delay={0.35}>
              <span className="font-serif text-4xl text-white md:text-5xl">
                Discover
              </span>
            </Item>

            <Item
              progress={smoothProgress}
              speed={55}
              delay={0.5}
              className="hidden md:block"
            >
              <a
                href="#gallery"
                className="group flex w-fit items-center gap-3 text-xs text-white/70 transition-colors hover:text-accent"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-accent/40 text-accent transition-colors group-hover:bg-accent group-hover:text-brand">
                  <ArrowDown />
                </span>
                View Gallery
              </a>
            </Item>
          </div>

          <Item progress={smoothProgress} speed={30} delay={0.4}>
            <h1 className="font-serif text-[17vw] leading-[0.9] italic tracking-tight text-white md:text-[12vw]">
              Sammy<em className="italic text-accent">Arts</em>
            </h1>
          </Item>

          {/* Mobile-only gallery button */}
          <Item
            progress={smoothProgress}
            speed={40}
            delay={0.55}
            className="md:hidden"
          >
            <a
              href="#gallery"
              className="group flex w-fit items-center gap-3 text-xs text-cream/70 transition-colors hover:text-accent"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/40 text-accent transition-colors group-hover:bg-accent group-hover:text-brand">
                <ArrowDown />
              </span>
              View Gallery
            </a>
          </Item>
        </div>
      </div>
    </section>
  );
}

export default Hero;
