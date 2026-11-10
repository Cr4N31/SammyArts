import FeaturedCard from "./FeaturedCard";

function FeaturedCourses({ items, onBuy, ratings = {}, onSubmitRating }) {
  const featured = items.find((course) => course.featured) || items[0];
  if (!featured) return null;

  return (
    <section aria-labelledby="featured-course-heading">
      <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">
        In focus
      </p>
      <FeaturedCard
        course={featured}
        onBuy={onBuy}
        headingId="featured-course-heading"
        ratingSummary={ratings[featured.slug || String(featured.id)]}
        onSubmitRating={onSubmitRating}
      />
    </section>
  );
}

export default FeaturedCourses;
