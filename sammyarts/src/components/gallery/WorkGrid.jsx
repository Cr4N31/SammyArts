import { motion, useReducedMotion } from "motion/react";
import WorkCard from "./WorkCard";

const EASE = [0.16, 1, 0.3, 1];
const MotionLi = motion.li;

const shapes = [
  "aspect-[9/10]",
  "aspect-[15/14]",
  "aspect-[4/3]",
  "aspect-[4/3]",
  "aspect-[15/14]",
  "aspect-[9/10]",
];

function WorkGrid({ works, onOpen }) {
  const reduceMotion = useReducedMotion();

  if (works.length === 0) {
    return (
      <p className="border-t border-border py-8 text-sm text-muted">
        No works in this category yet.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 items-start gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-3 md:gap-y-16">
      {works.map((work, i) => (
        <MotionLi
          key={work.id}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <WorkCard
            work={work}
            shape={shapes[i % shapes.length]}
            onOpen={() => onOpen?.(i)}
          />
        </MotionLi>
      ))}
    </ul>
  );
}

export default WorkGrid;
