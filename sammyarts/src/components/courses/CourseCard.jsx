import { motion } from "motion/react";
import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";

function CourseCard({ course, onBuy, index = 0 }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: "easeOut" }}
      className="group flex flex-col"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-white/5">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
        />
      </div>

      <p className="mt-4 text-[0.65rem] uppercase tracking-[0.14em] opacity-60">
        {course.type === "mentorship" ? "Mentorship" : "Course"} ·{" "}
        {course.level}
      </p>

      <h3 className="mt-2 font-serif text-xl font-semibold leading-tight tracking-[-0.02em]">
        {course.title}
      </h3>

      <p className="mt-1 text-xs opacity-50">
        {course.lessons} {course.type === "mentorship" ? "sessions" : "lessons"}{" "}
        · {course.duration}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <PriceTag price={course.price} billing={course.billing} />
        <BuyButton variant="ghost" label="Buy" onClick={() => onBuy(course)} />
      </div>
    </motion.li>
  );
}

export default CourseCard;
