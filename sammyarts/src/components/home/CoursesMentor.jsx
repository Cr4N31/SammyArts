import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useContent } from "../../data/content";

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
      className="group"
    >
      <div className="aspect-[4/5] overflow-hidden bg-raised ring-1 ring-border">
        {course.img ? (
          <img
            src={course.img}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center border border-dashed border-border text-xs text-muted">
            {course.title}
          </div>
        )}
      </div>
      <div className="mt-5">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          {course.type === "mentorship" ? "Mentorship" : "Course"}
          {course.level ? ` · ${course.level}` : ""}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-3xl italic tracking-[-0.03em] md:text-4xl">
            {course.title}
          </h3>
          {Number.isFinite(price) && price > 0 ? (
            <p className="shrink-0 text-sm uppercase tracking-[0.15em] text-accent">
              {money.format(price)}
            </p>
          ) : null}
        </div>
        {course.desc ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">{course.desc}</p>
        ) : null}
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
      <div className="mx-auto max-w-6xl">
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
          className="text-[clamp(3rem,10vw,9rem)] italic leading-[0.92] tracking-[-0.05em]"
        >
          Learn the craft.
          <br />
          Make it <MotionSpan className="text-accent">yours.</MotionSpan>
        </MotionH2>

        <MotionP
          {...fadeUp}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          className="mt-8 max-w-xl text-sm leading-relaxed text-muted md:text-base"
        >
          We teach artistic courses and run mentorship programs for people who
          want real skill, not just inspiration. Pick a path and start making.
        </MotionP>

        {preview.length > 0 ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:mt-24">
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
