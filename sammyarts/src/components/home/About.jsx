import { motion } from "motion/react";
import ServiceRing from "./ServiceRing";

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
      className="relative overflow-hidden px-6 pt-24 text-text md:px-10 md:pt-32"
    >
      {/* Intro block: label, heading, paragraph */}
      <div className="">
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
          Who is Sammy<span className="text-accent">Arts</span>?
        </MotionH2>

        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="mt-8 max-w-2xl md:mt-12"
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
      </div>

      {/* Services: full width, centered, with room for the scroll glow */}
      <ServiceRing className="mt-24 md:mt-40" />
    </MotionSection>
  );
}

export default About;
