import { useCallback, useState } from "react";
import { motion } from "motion/react";
import PriceTag from "./PriceTag";
import RatingWidget from "./RatingWidget";
import CourseDetailsModal from "./CourseDetailsModal";

const MotionLi = motion.li;

function CourseCard({
  course,
  courses,
  ratings,
  onBuy,
  index = 0,
  ratingSummary,
  onSubmitRating,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);

  return (
    <MotionLi
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: "easeOut" }}
      className="border-t rounded-2xl mb-6 border-border px-4 py-8 transition-colors duration-300 hover:bg-white/[0.02] motion-reduce:transition-none md:px-6 md:py-9"
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-10 ">
        <div className="min-w-0">
          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            {String(index + 1).padStart(2, "0")}{" "}
            <span aria-hidden="true">/</span> {course.category}
          </p>
          <h3 className="break-words font-serif text-2xl leading-tight tracking-[-0.03em] md:text-3xl">
            {course.title}
          </h3>
        </div>

        <RatingWidget
          course={course}
          ratingSummary={ratingSummary}
          onSubmitRating={onSubmitRating}
          idPrefix="rating"
        />

        <div className="flex items-center justify-between gap-5 md:justify-end">
          <PriceTag price={course.price} billing={course.billing} />
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setDetailsOpen(true)}
            className="min-h-11 border-b border-current pb-1 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Course details
          </button>
        </div>
      </div>
      {detailsOpen ? (
        <CourseDetailsModal
          course={course}
          courses={courses}
          ratings={ratings}
          onBuy={onBuy}
          onClose={closeDetails}
        />
      ) : null}
    </MotionLi>
  );
}

export default CourseCard;
