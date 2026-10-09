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
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-12 md:gap-16">
        {/* Headshot */}
        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, ease: EASE }}
          className="mx-auto w-full max-w-sm md:col-span-5 md:max-w-none"
        >
          <div className="relative">
            {headshot ? (
              <img
                src={headshot}
                alt="Sammy, founder and CEO"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <ImagePlaceholder
                label="CEO headshot"
                className="aspect-[4/5] w-full"
              />
            )}
            {/* Offset frame detail */}
            <div className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-full w-full border border-border" />
          </div>
          <div className="mt-6 text-sm">
            <p className="font-serif text-xl italic">Sammy</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Founder and CEO
            </p>
          </div>
        </MotionDiv>

        {/* Copy */}
        <div className="md:col-span-7">
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
            className="font-serif text-[clamp(3rem,9vw,7rem)] italic leading-[0.95] tracking-[-0.05em]"
          >
            Who is Sammy<span className="text-accent">Arts</span>?
          </MotionH2>

          <MotionDiv
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            className="mt-8 max-w-xl space-y-6 text-sm leading-relaxed text-muted md:text-base"
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
          </MotionDiv>

          <MotionA
            {...fadeUp}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            href="#gallery"
            className="mt-10 inline-flex hover:text-accent duration-250 transition-all items-center gap-3 border-b border-current pb-1 text-xs uppercase tracking-[0.2em]"
          >
            View the gallery
          </MotionA>
        </div>
      </div>
    </MotionSection>
  );
}

export default About;
