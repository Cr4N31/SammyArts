import { motion } from "motion/react";
import DisciplineList from "./DisciplineList";

const EASE = [0.16, 1, 0.3, 1];
const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

function About() {
  return (
    <MotionSection
      id="about"
      className="relative overflow-hidden px-6 py-24 text-text md:px-10 md:py-32"
    >
      {/* Label + heading */}
      <div>
        <MotionP
          {...fadeUp}
          transition={{ duration: 1, ease: EASE }}
          className="mb-6 text-xs uppercase tracking-[0.3em] text-muted"
        >
          About
        </MotionP>

        <MotionH2
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          className="font-serif text-[clamp(3rem,6vw,6.5rem)] leading-[0.95] tracking-[-0.05em]"
        >
          Who is Sammy<span className="text-accent">arts</span>?
        </MotionH2>
      </div>

      {/* Bio and disciplines on the same row, beneath the heading */}
      <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-12 md:items-start md:gap-x-6">
        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="max-w-2xl md:col-span-7"
        >
          <p className="text-base leading-relaxed text-text/80 md:text-lg">
            Samuel Olusola (Sammyarts) is an Artist, Brand Designer, and
            Creative Director focused on helping mid stage founders/brands
            communicate their message and improve the visual experience around
            their products, service or events, establishing distinctive visual
            identities through creative direction and visual storytelling. Over
            the years, he has collaborated with local and international brands
            across diverse industries.
          </p>
        </MotionDiv>

        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="md:col-span-4 md:col-start-9"
        >
          <DisciplineList className="w-full" />
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default About;
