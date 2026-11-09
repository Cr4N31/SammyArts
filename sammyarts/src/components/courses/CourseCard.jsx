import { useState } from "react";
import { motion } from "motion/react";
import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";

const MotionLi = motion.li;

function CourseCard({ course, onBuy, index = 0 }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <MotionLi
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: "easeOut" }}
      className="border-t border-border py-7 transition-colors duration-300 hover:bg-white/[0.02] motion-reduce:transition-none"
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-10">
        <div className="min-w-0">
          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            {String(index + 1).padStart(2, "0")}{" "}
            <span aria-hidden="true">/</span> {course.category}
          </p>
          <h3 className="break-words font-serif text-2xl leading-tight tracking-[-0.03em] md:text-3xl">
            {course.title}
          </h3>
          {course.desc ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {course.desc}
            </p>
          ) : null}
        </div>

        <div
          className="flex items-center gap-3 text-sm"
          aria-label={
            course.rating
              ? `${course.rating.toFixed(1)} out of 5 stars, ${course.reviews} reviews`
              : "Not rated yet"
          }
        >
          <span aria-hidden="true" className="text-accent">
            {course.rating ? "★" : "☆"}
          </span>
          <span>{course.rating ? course.rating.toFixed(1) : "Not rated"}</span>
          <span className="text-xs text-muted">
            {course.reviews
              ? `(${course.reviews} ${course.reviews === 1 ? "review" : "reviews"})`
              : "(No reviews yet)"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-5 md:justify-end">
          <PriceTag price={course.price} billing={course.billing} />
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            className="min-h-11 border-b border-current pb-1 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {detailsOpen ? "Close details" : "Course details"}
          </button>
        </div>
      </div>
      {detailsOpen ? (
        <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <p className="text-xs uppercase leading-relaxed tracking-[0.12em] text-muted">
            {course.level || "All levels"}
            {course.duration ? ` · ${course.duration}` : ""}
            {course.lessons ? ` · ${course.lessons} lessons` : ""}
          </p>
          <BuyButton label="Buy course" onClick={() => onBuy(course)} />
        </div>
      ) : null}
    </MotionLi>
  );
}

export default CourseCard;
