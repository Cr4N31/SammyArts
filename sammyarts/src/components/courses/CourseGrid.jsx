import CourseCard from "./CourseCard";

function CourseGrid({ items, onBuy }) {
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
        <CourseCard key={course.id} course={course} onBuy={onBuy} index={i} />
      ))}
    </ul>
  );
}

export default CourseGrid;
