import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../data/content";
import {
  listCourseRatings,
  submitCourseRating,
} from "../data/courseRatings";
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
  const [courseRatings, setCourseRatings] = useState([]);
  const [ratingsError, setRatingsError] = useState("");

  const handleBuy = (course) =>
    navigate(`/checkout/${course.slug || course.id}`);

  const courseSlugs = useMemo(
    () => courses.map((course) => course.slug || String(course.id)),
    [courses],
  );

  useEffect(() => {
    let active = true;
    listCourseRatings(courseSlugs)
      .then((items) => {
        if (active) {
          setCourseRatings(items);
          setRatingsError("");
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setRatingsError("Course ratings could not be loaded. Please try again later.");
        }
      });

    return () => {
      active = false;
    };
  }, [courseSlugs]);

  const ratingsByCourse = useMemo(() => {
    const groups = new Map();
    for (const item of courseRatings) {
      const group = groups.get(item.courseSlug) || {
        total: 0,
        count: 0,
        reviews: [],
      };
      group.total += item.rating;
      group.count += 1;
      if (item.review) group.reviews.push(item);
      groups.set(item.courseSlug, group);
    }

    return Object.fromEntries(
      [...groups].map(([slug, group]) => [
        slug,
        {
          average: group.total / group.count,
          count: group.count,
          reviews: group.reviews.slice(0, 3),
        },
      ]),
    );
  }, [courseRatings]);

  async function handleSubmitRating(course, values) {
    const item = await submitCourseRating({
      courseSlug: course.slug || String(course.id),
      ...values,
    });
    setCourseRatings((current) => [item, ...current]);
  }

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
      if (sortBy === "rating") {
        return (
          (ratingsByCourse[b.slug || String(b.id)]?.average || 0) -
          (ratingsByCourse[a.slug || String(a.id)]?.average || 0)
        );
      }
      return Number(b.featured) - Number(a.featured);
    });
  }, [courses, search, activeCategory, sortBy, ratingsByCourse]);

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
            <label className="flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-muted">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-11 border-b border-border bg-brand py-2 text-sm normal-case tracking-normal text-text outline-none focus:border-accent focus-visible:ring-1 focus-visible:ring-accent"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Rating</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-7 border-b border-border py-5 md:flex-row md:items-center md:justify-between">
            <CourseFilter
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="self-start border-b border-transparent pb-1 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-border hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:self-auto"
              >
                Clear search
              </button>
            ) : null}
          </div>

          <div className="py-10 md:py-14">
            <FeaturedCourses
              items={filteredCourses}
              onBuy={handleBuy}
              ratings={ratingsByCourse}
              onSubmitRating={handleSubmitRating}
            />
          </div>

          {ratingsError ? (
            <p role="alert" className="mb-5 text-sm text-accent">
              {ratingsError}
            </p>
          ) : null}
          <CourseGrid
            items={filteredCourses}
            onBuy={handleBuy}
            ratings={ratingsByCourse}
            onSubmitRating={handleSubmitRating}
          />
        </section>
      </div>
    </main>
  );
}

export default Courses;
