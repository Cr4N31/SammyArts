import { useNavigate } from "react-router-dom";
import { useContent } from "../data/content";
import CoursesHeader from "../components/courses/CoursesHeader";
import CourseGrid from "../components/courses/CourseGrid";

function Courses() {
  const navigate = useNavigate();
  const { courses } = useContent();

  const handleBuy = (course) =>
    navigate(`/checkout/${course.slug || course.id}`);

  return (
    <section
      id="courses"
      className="page-reveal bg-brand px-6 py-24 text-white md:px-12 md:py-32"
    >
      <CoursesHeader />
      <CourseGrid items={courses} onBuy={handleBuy} />
    </section>
  );
}

export default Courses;
