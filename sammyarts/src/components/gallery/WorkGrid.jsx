import { motion, useReducedMotion } from "motion/react";
import WorkCard from "./WorkCard";

const MotionLi = motion.li;
const EASE = [0.16, 1, 0.3, 1];

// Image heights repeat every six works and mirror from row to row:
// tall, medium, wide, then wide, medium, tall. Items are top aligned,
// which leaves the uneven gaps under the shorter ones.
const shapes = [
  "aspect-[9/10]",
  "aspect-[15/14]",
  "aspect-[4/3]",
  "aspect-[4/3]",
  "aspect-[15/14]",
  "aspect-[9/10]",
];

// Three columns on tablet and up, two on phones
function WorkGrid({ works, onOpen }) {
  const reduceMotion = useReducedMotion();

  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-x-2 gap-y-12 md:grid-cols-3 md:gap-x-3 md:gap-y-16">
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
            onOpen={() => onOpen(i)}
          />
        </MotionLi>
      ))}
    </ul>
  );
}

export default WorkGrid;
