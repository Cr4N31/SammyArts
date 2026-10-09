import CourseCard from "./CourseCard";

function CourseGrid({ items, onBuy }) {
  if (!items.length) {
    return <p className="text-sm opacity-50">Nothing here yet.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((course, i) => (
        <CourseCard key={course.id} course={course} onBuy={onBuy} index={i} />
      ))}
    </ul>
  );
}

export default CourseGrid;
