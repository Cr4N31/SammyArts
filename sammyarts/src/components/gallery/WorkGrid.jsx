import { motion, useReducedMotion } from "motion/react";
import WorkCard from "./WorkCard";

const EASE = [0.16, 1, 0.3, 1];
const MotionLi = motion.li;

// Every tile in a category shares one shape, like a contact sheet. A square
// crops mixed social and campaign work the least, and thumbnails are 16:9, so
// they get that shape. Add a category name here to give it its own shape.
const DEFAULT_ASPECT = "aspect-square";
const ASPECT_BY_CATEGORY = {
  Thumbnails: "aspect-video",
};

function WorkGrid({ works, onOpen }) {
  const reduceMotion = useReducedMotion();

  if (works.length === 0) {
    return (
      <p className="border-t border-border py-8 text-sm text-muted">
        No works in this category yet.
      </p>
    );
  }

  const aspect = ASPECT_BY_CATEGORY[works[0].category] ?? DEFAULT_ASPECT;

  return (
    <ul className="grid grid-cols-1 items-start gap-x-2.5 gap-y-8 sm:grid-cols-2 md:gap-y-12">
      {works.map((work, i) => (
        <MotionLi
          key={work.id}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.8,
            // Staggers the two tiles of a row
            delay: reduceMotion ? 0 : (i % 2) * 0.08,
            ease: EASE,
          }}
        >
          <WorkCard work={work} shape={aspect} onOpen={() => onOpen?.(i)} />
        </MotionLi>
      ))}
    </ul>
  );
}

export default WorkGrid;
