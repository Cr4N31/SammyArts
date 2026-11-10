import CourseCard from "./CourseCard";

function CourseGrid({ items, allCourses, onBuy, ratings, onSubmitRating }) {
  if (!items.length) {
    return (
      <p className="border-t border-border py-8 text-sm text-muted">
        No courses match your search. Try another term or category.
      </p>
    );
  }

  return (
    <ul aria-label="Course collection" className="grid grid-cols-1">
      {items.map((course, i) => (
        <CourseCard
          key={course.id}
          course={course}
          courses={allCourses}
          ratings={ratings}
          onBuy={onBuy}
          index={i}
          ratingSummary={ratings[course.slug || String(course.id)]}
          onSubmitRating={onSubmitRating}
        />
      ))}
    </ul>
  );
}

export default CourseGrid;
