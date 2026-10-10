import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../data/content";
import CoursesHeader from "../components/courses/CoursesHeader";
import FeaturedCourses from "../components/courses/FeaturedCourses";
import CourseFilter from "../components/courses/CourseFilter";
import CourseGrid from "../components/courses/CourseGrid";

function Courses() {
  const navigate = useNavigate();
  const { courses } = useContent();
  const [filter, setFilter] = useState("all");

  const featured = useMemo(
    () => courses.filter((course) => course.featured),
    [courses],
  );
  const visible = useMemo(
    () =>
      filter === "all"
        ? courses
        : courses.filter((course) => course.type === filter),
    [courses, filter],
  );

  const handleBuy = (course) =>
    navigate(`/checkout/${course.slug || course.id}`);

  return (
    <section
      id="courses"
      className="page-reveal bg-brand px-6 py-24 text-white md:px-12 md:py-32"
    >
      <CoursesHeader />
      <FeaturedCourses items={featured} onBuy={handleBuy} />
      <CourseFilter active={filter} onChange={setFilter} />
      <CourseGrid key={filter} items={visible} onBuy={handleBuy} />
    </section>
  );
}

export default Courses;
