import { motion } from "motion/react";
import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";

const MotionLi = motion.li;

function CourseCard({ course, onBuy, index = 0 }) {
  return (
    <MotionLi
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: "easeOut" }}
      className="flex flex-col border-t border-border py-6"
    >
      <div className="flex flex-1 flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <h3 className="font-serif text-2xl leading-tight tracking-[-0.02em] md:text-3xl">
          {course.title}
        </h3>
        <div className="flex items-center justify-between gap-6 sm:justify-end">
        <PriceTag price={course.price} billing={course.billing} />
        <BuyButton variant="ghost" label="Buy" onClick={() => onBuy(course)} />
        </div>
      </div>
    </MotionLi>
  );
}

export default CourseCard;
