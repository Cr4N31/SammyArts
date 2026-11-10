import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";
import RatingWidget from "./RatingWidget";

function FeaturedCard({
  course,
  onBuy,
  headingId,
  ratingSummary,
  onSubmitRating,
}) {
  return (
    <article className="border-y rounded-3xl border-border bg-surface/50 px-6 py-8 md:px-10 md:py-12">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="mb-4 text-[0.65rem] uppercase tracking-[0.18em] text-accent">
            Editor&rsquo;s pick · {course.category}
          </p>
          <h2
            id={headingId}
            className="max-w-3xl font-serif text-[clamp(2.5rem,5vw,5rem)] leading-[0.98] tracking-[-0.045em]"
          >
            {course.title}
          </h2>
          <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">
            {course.desc ||
              "Build a more confident creative practice through focused lessons, practical exercises, and thoughtful guidance."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:justify-end">
          <RatingWidget
            course={course}
            ratingSummary={ratingSummary}
            onSubmitRating={onSubmitRating}
            idPrefix="featured-rating"
          />
          <PriceTag price={course.price} billing={course.billing} size="lg" />
          <BuyButton label="Buy course" onClick={() => onBuy(course)} />
        </div>
      </div>
    </article>
  );
}

export default FeaturedCard;
