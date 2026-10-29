import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useContent } from "../../data/content";

const EASE = [0.16, 1, 0.3, 1];
const MotionSection = motion.section;
const MotionP = motion.p;
const MotionH2 = motion.h2;
const MotionDiv = motion.div;
const MotionUl = motion.ul;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const facts = ["Beginner friendly", "Online and in person", "Limited seats"];

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function CourseCard({ course, index }) {
  const price = Number(course.price);
  return (
    <MotionDiv
      {...fadeUp}
      transition={{ duration: 1, delay: index * 0.08, ease: EASE }}
      className="border-t border-border py-5"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
        <h3 className="font-serif text-2xl italic tracking-[-0.03em] md:text-3xl">
          {course.title}
        </h3>
        {Number.isFinite(price) && price > 0 ? (
          <p className="shrink-0 text-sm uppercase tracking-[0.15em] text-accent">
            {money.format(price)}
          </p>
        ) : (
          <p className="shrink-0 text-sm uppercase tracking-[0.15em] text-accent">
            Free
          </p>
        )}
      </div>
    </MotionDiv>
  );
}

function CoursesMentor() {
  const { courses, ready } = useContent();
  const preview = courses.slice(0, 3);

  return (
    <MotionSection
      id="courses"
      className="relative overflow-hidden px-5 py-24 text-text md:px-10 md:py-36"
    >
      <div className="">
        <MotionP
          {...fadeUp}
          transition={{ duration: 1, ease: EASE }}
          className="mb-6 text-xs uppercase tracking-[0.3em] text-muted"
        >
          Courses and Mentorship
        </MotionP>

        <MotionH2
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          className="text-[clamp(3.5rem,4vw,7rem)] leading-[0.92] tracking-[-0.05em]"
        >
          Learn the principles
          <br />
          Build your <span className="text-accent">style</span>
        </MotionH2>

        <MotionP
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="mt-8 max-w-xl text-sm leading-relaxed text-muted md:text-base"
        >
          Develop your creative skills through practical courses and mentorship
          designed to help you master your craft, refine your visual thinking,
          and turn your creative potential into purposeful work.
        </MotionP>

        {preview.length > 0 ? (
          <div className="mt-16 border-b border-border md:mt-24">
            {preview.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : ready ? (
          <p className="mt-16 text-sm text-muted">No courses yet.</p>
        ) : null}

        <MotionUl
          {...fadeUp}
          transition={{ duration: 1, ease: EASE }}
          className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted"
        >
          {facts.map((fact) => (
            <li key={fact} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {fact}
            </li>
          ))}
        </MotionUl>

        <MotionDiv
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          className="mt-16 flex flex-col items-start gap-6 md:mt-24 md:flex-row md:items-center md:justify-between"
        >
          <p className="text-2xl italic tracking-[-0.03em] md:text-4xl">
            Ready to start?
          </p>

          <Link
            to="/atelier"
            className="group inline-flex items-center gap-4 rounded-full bg-accent px-8 py-4 text-sm uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Browse courses
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </MotionDiv>
      </div>
    </MotionSection>
  );
}

export default CoursesMentor;
