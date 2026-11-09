import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../data/content";
import CoursesHeader from "../components/courses/CoursesHeader";
import CourseFilter from "../components/courses/CourseFilter";
import CourseGrid from "../components/courses/CourseGrid";
import FeaturedCourses from "../components/courses/FeaturedCourses";

function Courses() {
  const navigate = useNavigate();
  const { courses } = useContent();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const handleBuy = (course) =>
    navigate(`/checkout/${course.slug || course.id}`);

  const categories = useMemo(
    () => [
      { value: "all", label: "All courses" },
      ...Array.from(new Set(courses.map((course) => course.category)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((category) => ({
          value: category,
          label: category,
        })),
    ],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matching = courses.filter((course) => {
      const matchesCategory =
        activeCategory === "all" || course.category === activeCategory;
      const searchable = [
        course.title,
        course.desc,
        course.category,
        course.level,
        course.type,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return matchesCategory && (!query || searchable.includes(query));
    });

    return matching.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return Number(b.featured) - Number(a.featured);
    });
  }, [courses, search, activeCategory, sortBy]);

  return (
    <main
      id="courses"
      className="page-reveal bg-brand px-5 pb-24 pt-28 text-text md:px-10 md:pb-32 md:pt-36"
    >
      <div className="mx-auto max-w-6xl">
        <CoursesHeader search={search} onSearchChange={setSearch} />

        <section
          aria-labelledby="course-collection-heading"
          className="mt-12 md:mt-16"
        >
          <div className="flex flex-col gap-7 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-[0.18em] text-muted"
                role="status"
                aria-live="polite"
              >
                {filteredCourses.length}{" "}
                {filteredCourses.length === 1 ? "course" : "courses"}
              </p>
              <h2
                id="course-collection-heading"
                className="mt-2 font-serif text-3xl tracking-[-0.04em] md:text-4xl"
              >
                The collection
              </h2>
            </div>
          </div>

          <div className="py-10 md:py-14">
            <FeaturedCourses items={filteredCourses} onBuy={handleBuy} />
          </div>

          <CourseGrid items={filteredCourses} onBuy={handleBuy} />
        </section>
      </div>
    </main>
  );
}

export default Courses;
