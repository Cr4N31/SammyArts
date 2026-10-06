import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];
const MotionSection = motion.section;
const MotionP = motion.p;
const MotionH2 = motion.h2;
const MotionSpan = motion.span;
const MotionDiv = motion.div;
const MotionUl = motion.ul;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

// Placeholder copy, replace with the real offers
const offers = [
  {
    no: "01",
    title: "Courses",
    desc: "Structured lessons that take you from your first sketch to a finished piece. Learn at your own pace, with clear projects at every stage.",
  },
  {
    no: "02",
    title: "Mentorship",
    desc: "One on one guidance from a working artist. Honest critique, a personal plan, and direct feedback on your portfolio.",
  },
  {
    no: "03",
    title: "Workshops",
    desc: "Short, hands-on sessions focused on a single technique. Show up, make something, leave with a finished piece.",
  },
];

// Placeholder facts, replace with the real ones
const facts = ["Beginner friendly", "Online and in person", "Limited seats"];

function CoursesMentor() {
  const ref = useRef(null);

  // Animate the background as the section scrolls into view.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 30%"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  // Slides the tall gradient: solid orange -> soft blend -> solid dark
  const backgroundPositionY = useTransform(progress, [0, 1], ["0%", "100%"]);
  const textColor = useTransform(
    progress,
    [0.35, 0.85],
    ["#f6ede6", "#120d0d"],
  );
  const headingColor = useTransform(
    progress,
    [0.35, 0.85],
    ["#f6ede6", "#120d0d"],
  );

  return (
    <MotionSection
      ref={ref}
      id="courses"
      style={{
        backgroundColor: "#f78e48",
        backgroundSize: "100% 400%",
        backgroundPositionY,
        color: textColor,
      }}
      className="relative overflow-hidden px-5 py-24 md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        {/* Eyebrow */}
        <MotionP
          {...fadeUp}
          transition={{ duration: 1, ease: EASE }}
          className="mb-6 text-xs uppercase tracking-[0.3em] opacity-70"
        >
          Courses and Mentorship
        </MotionP>

        {/* Headline */}
        <MotionH2
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          className="text-[clamp(3rem,10vw,9rem)] italic leading-[0.92] tracking-[-0.05em]"
        >
          Learn the craft.
          <br />
          <MotionSpan style={{ color: headingColor }}>
            Make it yours.
          </MotionSpan>
        </MotionH2>

        <MotionP
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="mt-8 max-w-xl text-sm leading-relaxed opacity-80 md:text-base"
        >
          We teach artistic courses and run mentorship programs for people who
          want real skill, not just inspiration. Pick a path and start making.
        </MotionP>

        {/* Offers */}
        <div className="mt-16 md:mt-24">
          {offers.map((offer, i) => (
            <MotionDiv
              key={offer.no}
              {...fadeUp}
              transition={{ duration: 1, delay: i * 0.08, ease: EASE }}
              className="group grid gap-4 border-t border-current/30 py-8 md:grid-cols-12 md:items-start md:gap-8 md:py-10"
            >
              <span className="text-xs tracking-[0.2em] opacity-60 md:col-span-1 md:pt-3">
                {offer.no}
              </span>
              <h3 className="font-serif text-4xl italic leading-none tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-2 md:col-span-5 md:text-6xl">
                {offer.title}
              </h3>
              <p className="max-w-md text-sm leading-relaxed opacity-80 md:col-span-6 md:pt-2 md:text-base">
                {offer.desc}
              </p>
            </MotionDiv>
          ))}
          <div className="border-t border-current/30" />
        </div>

        {/* Facts */}
        <MotionUl
          {...fadeUp}
          transition={{ duration: 1, ease: EASE }}
          className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] opacity-70"
        >
          {facts.map((fact) => (
            <li key={fact} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {fact}
            </li>
          ))}
        </MotionUl>

        {/* CTA */}
        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          className="mt-16 flex flex-col items-start gap-6 md:mt-24 md:flex-row md:items-center md:justify-between"
        >
          <p className="text-2xl italic tracking-[-0.03em] md:text-4xl">
            Ready to start?
          </p>

          <a
            href="/courses"
            className="group inline-flex items-center gap-4 rounded-full bg-accent px-8 py-4 text-sm uppercase tracking-[0.2em] text-brand transition-colors hover:text-accent duration-300 hover:bg-cream"
          >
            Browse courses
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default CoursesMentor;
