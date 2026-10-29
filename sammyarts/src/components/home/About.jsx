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
      className="relative overflow-hidden px-6 py-24 text-text md:px-10 md:py-32"
    >
      {/* Heading, top left */}
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
        className="font-serif text-[clamp(3.5rem,4vw,7rem)] leading-[0.95] tracking-[-0.05em]"
      >
        Who is Sammy<span className="text-accent">Arts</span>?
      </MotionH2>

      {/* Two columns: copy on the left, services carousel on the right */}
      <div className="mt-10 grid gap-14 md:mt-14 md:grid-cols-12 md:items-start md:gap-x-12">
        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="space-y-6 text-sm leading-relaxed text-muted md:col-span-5 md:text-base lg:col-span-4"
        >
          <p>
            Samuel Olusola (Sammyarts) is an Artist, Brand Designer, and
            Creative Director focused on helping mid stage founders/brands
            communicate their message and improve the visual experience around
            their products, service or events, establishing distinctive visual
            identities through creative direction and visual storytelling. Over
            the years, he has collaborated with local and international brands
            across diverse industries.
          </p>
        </MotionDiv>

        {/* Point readMoreHref at your real services route, or drop it to hide the link */}
        <ServiceRing
          readMoreHref="/services"
          className="min-w-0 md:col-span-7 lg:col-span-8"
        />
      </div>
    </MotionSection>
  );
}

export default About;
