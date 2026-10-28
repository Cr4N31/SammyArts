import { motion } from "motion/react";
import { useContent } from "../../data/content";

const EASE = [0.16, 1, 0.3, 1];
const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;
const MotionA = motion.a;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const ImagePlaceholder = ({ label, className = "" }) => (
  <div
    className={`grid place-items-center border border-dashed border-border bg-raised text-xs text-muted ${className}`}
  >
    {label}
  </div>
);

function About() {
  const { site, works } = useContent();
  const headshot =
    site.ceo && !works.some((work) => work.img === site.ceo) ? site.ceo : "";

  return (
    <MotionSection
      id="about"
      className="relative overflow-hidden px-6 py-24 text-text md:px-10 md:py-32"
    >
      <MotionP
        {...fadeUp}
        transition={{ duration: 1, ease: EASE }}
        className="mb-6 text-xs uppercase tracking-[0.3em] text-muted"
      >
        About
      </MotionP>
      <div className="items-center gap-12">
        {/* Copy */}
        <div className="md:col-span-7">
          <MotionH2
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
            className="font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.95] tracking-[-0.05em]"
          >
            Who is Sammy<span className="text-accent">Arts</span>?
          </MotionH2>

          <MotionDiv
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            className="mt-8 space-y-6 text-sm leading-relaxed text-muted md:text-base"
          >
            <p>
              Samuel Olusola (Sammyarts) is an Artist, Brand Designer, and
              Creative Director focused on helping mid stage founders/brands
              communicate their message and improve the visual experience around
              their products, service or events, establishing distinctive visual
              identities through creative direction and visual storytelling.
              Over the years, he has collaborated with local and international
              brands across diverse industries.
            </p>
            <p>
              His work is recognized for its original concepts, refined
              presentation, and ability to communicate complex brand messages
              through compelling visual design. His creative approach has
              influenced emerging design trends, inspiring a generation of
              designers across Africa through his distinctive style and
              transparent creative process. Committed to pushing the boundaries
              of excellence, Samuel continues to champion a design philosophy,
              believing that exceptional design should not only solve problems
              but also leave a lasting impression.
            </p>
          </MotionDiv>
        </div>
      </div>
    </MotionSection>
  );
}

export default About;
