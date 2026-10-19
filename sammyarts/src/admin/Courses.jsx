import { useCallback, useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useContent } from "../data/content";

const blank = {
  id: null,
  title: "",
  price: "",
  type: "course",
  billing: "one-time",
  featured: false,
};

const labelClass = "mb-2 block text-xs uppercase tracking-[0.2em] text-muted";

const fieldClass =
  "w-full border border-border bg-bg px-3 py-3 text-base text-text outline-none transition-colors duration-300 focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none";

const pillClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const ghostClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-bg/80 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors duration-300 hover:border-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

const textLinkClass =
  "inline-flex min-h-11 cursor-pointer items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function Notice({ message, onClear }) {
  useEffect(() => {
    if (!message) return undefined;
    const id = setTimeout(onClear, 2200);
    return () => clearTimeout(id);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 border border-border bg-surface px-5 py-4 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
    >
      <p className="font-serif text-2xl italic tracking-[-0.03em] text-accent">
        Saved
      </p>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}

function CourseList() {
  const { courses, saveCourses } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [notice, setNotice] = useState(() =>
    typeof location.state?.notice === "string" ? location.state.notice : "",
  );
  const clearNotice = useCallback(() => setNotice(""), []);

  useEffect(() => {
    if (!location.state?.notice) return undefined;
    navigate(".", { replace: true, state: {} });
    return undefined;
  }, [location.state, navigate]);

  async function removeCourse(id) {
    setSaving(true);
    setSaveError("");
    try {
      await saveCourses(courses.filter((course) => course.id !== id));
      setConfirmId(null);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Notice message={notice} onClear={clearNotice} />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Learn
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
            The <span className="text-accent">courses</span>
          </h1>
        </div>
        <Link to="/admin/courses/new" className={pillClass}>
          New course
        </Link>
      </div>

      <p className="mt-6 text-sm text-muted">
        <span className="font-serif text-4xl italic text-accent">
          {String(courses.length).padStart(2, "0")}
        </span>
        <span className="mt-1 block">
          {saving ? "Saving" : "Courses on the site"}
        </span>
      </p>
      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {saveError}
        </p>
      ) : null}

      <ul className="mt-10">
        {courses.length === 0 ? (
          <li className="border-t border-border py-8 text-sm text-muted">
            No courses yet.
          </li>
        ) : (
          courses.map((course, index) => (
            <li
              key={course.id}
              className="grid items-center gap-4 border-t border-border py-6 last:border-b sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, "0")} · ₦
                  {Number(course.price).toLocaleString()}
                </p>
                <h2 className="mt-1 font-serif text-3xl italic tracking-[-0.03em] break-words">
                  <Link
                    to={`/admin/courses/${course.id}`}
                    className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {course.title}
                  </Link>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link to={`/admin/courses/${course.id}`} className={ghostClass}>
                  Open
                </Link>
                {confirmId === course.id ? (
                  <>
                    <button
                      type="button"
                      className={pillClass}
                      disabled={saving}
                      onClick={() => removeCourse(course.id)}
                    >
                      Delete it
                    </button>
                    <button
                      type="button"
                      className={ghostClass}
                      disabled={saving}
                      onClick={() => setConfirmId(null)}
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={ghostClass}
                    disabled={saving}
                    onClick={() => setConfirmId(course.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function CourseEditor() {
  const { id } = useParams();
  const isNew = !id;
  const { courses, saveCourses } = useContent();
  const navigate = useNavigate();
  const existing = courses.find((course) => String(course.id) === id);
  const [draft, setDraft] = useState(() =>
    existing
      ? {
          ...existing,
          price: existing.price === 0 ? "" : String(existing.price ?? ""),
        }
      : blank,
  );
  const [titleError, setTitleError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "title") setTitleError("");
  }

  async function onSave(e) {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setTitleError("Add a title.");
      return;
    }

    const item = {
      ...existing,
      id: draft.id ?? Date.now(),
      title,
      price: Number(String(draft.price).replace(/[^\d]/g, "")) || 0,
      type: existing?.type || "course",
      billing: existing?.billing || "one-time",
      slug: String(draft.slug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    };
    const next = isNew
      ? [...courses, item]
      : courses.map((course) => (String(course.id) === id ? item : course));

    setSaving(true);
    setSaveError("");
    setTitleError("");
    try {
      await saveCourses(next);
      navigate("/admin/courses", {
        state: {
          notice: isNew ? "Course added." : "Course saved.",
        },
      });
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    setSaveError("");
    try {
      await saveCourses(courses.filter((course) => String(course.id) !== id));
      navigate("/admin/courses", { state: { notice: "Course deleted." } });
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  if (!isNew && !existing) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Course</p>
        <h1 className="mt-4 font-serif text-5xl italic">
          This course is not on the site.
        </h1>
        <Link to="/admin/courses" className={`${textLinkClass} mt-8`}>
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="border border-border bg-surface p-5 md:p-8">
      <Link to="/admin/courses" className={textLinkClass}>
        All courses
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
        {isNew ? "New course" : draft.title || "Edit course"}
      </h1>
      <div className="mt-8 max-w-2xl">
        <div className="grid gap-5">
          {titleError || saveError ? (
            <p role="alert" className="text-sm text-accent">
              {titleError || saveError}
            </p>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="course-title" className={labelClass}>
                Course name
              </label>
              <input
                id="course-title"
                value={draft.title}
                onChange={(e) => updateDraft("title", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="course-price" className={labelClass}>
                Price (NGN)
              </label>
              <input
                id="course-price"
                type="number"
                min="0"
                step="1"
                value={draft.price}
                placeholder="e.g. 45000"
                onChange={(e) => updateDraft("price", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className={pillClass}
            >
              {saving ? "Saving" : "Save course"}
            </button>
            {!isNew && !confirmRemove ? (
              <button
                type="button"
                className={ghostClass}
                disabled={saving}
                onClick={() => setConfirmRemove(true)}
              >
                Remove
              </button>
            ) : null}
            {confirmRemove ? (
              <>
                <button
                  type="button"
                  className={pillClass}
                  disabled={saving}
                  onClick={remove}
                >
                  Remove it
                </button>
                <button
                  type="button"
                  className={ghostClass}
                  onClick={() => setConfirmRemove(false)}
                >
                  Keep
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}

function CoursePage() {
  const { id } = useParams();
  return <CourseEditor key={id ?? "new"} />;
}

function Courses() {
  return (
    <Routes>
      <Route index element={<CourseList />} />
      <Route path="new" element={<CoursePage />} />
      <Route path=":id" element={<CoursePage />} />
    </Routes>
  );
}

export default Courses;
