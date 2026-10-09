import FeaturedCard from "./FeaturedCard";

function FeaturedCourses({ items, onBuy }) {
  const [first, ...rest] = items;
  if (!first) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <FeaturedCard course={first} large onBuy={onBuy} index={0} />
      {rest.slice(0, 2).map((course, i) => (
        <FeaturedCard
          key={course.id}
          course={course}
          onBuy={onBuy}
          index={i + 1}
        />
      ))}
    </div>
  );
}

export default FeaturedCourses;
