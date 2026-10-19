import CourseCard from "./CourseCard";

function CourseGrid({ items, onBuy }) {
  if (!items.length) {
    return <p className="text-sm opacity-50">Nothing here yet.</p>;
  }

  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-1">
      {items.map((course, i) => (
        <CourseCard key={course.id} course={course} onBuy={onBuy} index={i} />
      ))}
    </ul>
  );
}

export default CourseGrid;
