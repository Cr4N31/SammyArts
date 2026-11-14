import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../data/content";
import { listCourseRatings, submitCourseRating } from "../data/courseRatings";
import { defaultCourseFaqs, getCourseFaqs } from "../data/courseFaqs";
import CoursesHeader from "../components/courses/CoursesHeader";
import CourseFilter from "../components/courses/CourseFilter";
import CourseGrid from "../components/courses/CourseGrid";
import FeaturedCourses from "../components/courses/FeaturedCourses";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Rating" },
];

function Courses() {
  const navigate = useNavigate();
  const { courses } = useContent();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const sortTriggerRef = useRef(null);
  const [courseRatings, setCourseRatings] = useState([]);
  const [ratingsError, setRatingsError] = useState("");
  const [faqs, setFaqs] = useState(defaultCourseFaqs);

  useEffect(() => {
    let active = true;
    getCourseFaqs()
      .then((items) => {
        if (active) setFaqs(items);
      })
      .catch((error) => console.error(error));
    return () => {
      active = false;
    };
  }, []);

  const handleBuy = (course) =>
    navigate(`/checkout/${course.slug || course.id}`);

  useEffect(() => {
    if (!sortOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!sortRef.current?.contains(event.target)) setSortOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSortOpen(false);
        sortTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sortOpen]);

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
          setRatingsError(
            "Course ratings could not be loaded. Please try again later.",
          );
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
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-muted">
              <span>Sort by</span>
              <div ref={sortRef} className="relative">
                <button
                  ref={sortTriggerRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  aria-label={`Sort by ${SORT_OPTIONS.find((option) => option.value === sortBy)?.label}`}
                  onClick={() => setSortOpen((open) => !open)}
                  className="flex min-h-11 min-w-44 items-center justify-between gap-5 rounded-full border border-border bg-surface py-2 pl-4 pr-4 text-sm normal-case tracking-normal text-text outline-none transition-colors hover:border-accent/60 focus-visible:ring-1 focus-visible:ring-accent"
                >
                  {
                    SORT_OPTIONS.find((option) => option.value === sortBy)
                      ?.label
                  }
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`h-3.5 w-3.5 shrink-0 text-accent transition-transform ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="m3.5 6 4.5 4 4.5-4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                {sortOpen ? (
                  <div
                    role="listbox"
                    aria-label="Sort courses"
                    className="absolute right-0 top-full z-30 mt-2 min-w-full overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={sortBy === option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOpen(false);
                          sortTriggerRef.current?.focus();
                        }}
                        className={`flex min-h-10 w-full items-center justify-between gap-6 whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs normal-case tracking-normal transition-colors hover:bg-raised hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                          sortBy === option.value
                            ? "bg-raised text-accent"
                            : "text-muted"
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value ? (
                          <span aria-hidden="true" className="text-accent">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
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
            allCourses={courses}
            onBuy={handleBuy}
            ratings={ratingsByCourse}
            onSubmitRating={handleSubmitRating}
          />
        </section>

        <section
          aria-labelledby="courses-faq-heading"
          className="mt-20 border-t border-border pt-8 md:mt-28"
        >
          <h2
            id="courses-faq-heading"
            className="mb-5 font-serif text-3xl tracking-[-0.04em] md:text-4xl"
          >
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border">
            {faqs.map((faq, faqIndex) => (
              <details key={faqIndex} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-accent transition-transform group-open:rotate-180"
                  >
                    ↓
                  </span>
                </summary>
                {faq.answer ? (
                  <p className="max-w-3xl whitespace-pre-line pb-3 pr-8 text-sm leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                ) : null}
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Still have a question?{" "}
            <Link
              to="/contact"
              className="border-b border-current transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Contact SammyArts
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Courses;
