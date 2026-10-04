import { motion, useScroll, useSpring, useTransform } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

// Swap for <img className="h-full w-full object-cover" /> when you have the headshot
const ImagePlaceholder = ({ label, className = "" }) => (
  <div
    className={`grid place-items-center border border-dashed border-brand/40 bg-brand/10 text-xs text-brand/70 ${className}`}
  >
    {label}
  </div>
);

function About({ sectionRef }) {
  // Finish the orange transition as the section's bottom reaches the viewport.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  // Slides the tall gradient: solid dark -> soft blend -> solid orange
  const backgroundPositionY = useTransform(progress, [0, 1], ["0%", "100%"]);

  // Text starts light (on the dark part) and flips to dark (on the orange)
  const textColor = useTransform(
    progress,
    [0.35, 0.85],
    ["#f6ede6", "#120d0d"],
  );

  return (
    <motion.section
      ref={sectionRef}
      id="about"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, #120d0d 0%, #120d0d 25%, #f78e48 75%, #f78e48 100%)",
        backgroundSize: "100% 400%",
        backgroundPositionY,
        color: textColor,
      }}
      className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-12 md:gap-16">
        {/* Headshot */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 1.2, ease: EASE }}
          className="mx-auto w-full max-w-sm md:col-span-5 md:max-w-none"
        >
          <div className="relative">
            <ImagePlaceholder
              label="CEO headshot"
              className="aspect-[4/5] w-full"
            />
            {/* Offset frame detail */}
            <div className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-full w-full border border-brand/40" />
          </div>
          <div className="mt-6 text-sm">
            <p className="font-serif text-xl italic">Sammy</p>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">
              Founder and CEO
            </p>
          </div>
        </motion.div>

        {/* Copy */}
        <div className="md:col-span-7">
          <motion.p
            {...fadeUp}
            transition={{ duration: 1, ease: EASE }}
            className="mb-6 text-xs uppercase tracking-[0.3em] opacity-70"
          >
            About
          </motion.p>

          <motion.h2
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
            className="font-serif text-[clamp(3rem,9vw,7rem)] italic leading-[0.95] tracking-[-0.05em]"
          >
            Who is SammyArts?
          </motion.h2>

          <motion.div
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            className="mt-8 max-w-xl space-y-6 text-sm leading-relaxed md:text-base"
          >
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Non
              quidem quasi nostrum rerum ab excepturi quaerat possimus voluptate
              explicabo minus dignissimos, dolor repellat. Aliquid at molestiae,
              error totam ea nobis nulla harum vel!
            </p>
            <p>
              A praesentium non fugiat quisquam quas nemo modi, excepturi
              cupiditate sunt sequi sit eos perspiciatis illum magni tenetur
              error repudiandae debitis.
            </p>
          </motion.div>

          <motion.a
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            href="#gallery"
            className="mt-10 inline-flex items-center gap-3 border-b border-current pb-1 text-xs uppercase tracking-[0.2em]"
          >
            View the gallery
          </motion.a>
        </div>
      </div>
    </motion.section>
  );
}

export default About;
