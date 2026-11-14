import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourseFaqs, saveCourseFaqs } from "../data/courseFaqs";

const labelClass = "mb-2 block text-xs uppercase tracking-[0.2em] text-muted";

const fieldClass =
  "w-full border border-border bg-bg px-3 py-3 text-base text-text outline-none transition-colors duration-300 focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none";

const pillClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const ghostClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-bg/80 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors duration-300 hover:border-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

const textLinkClass =
  "inline-flex min-h-11 cursor-pointer items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function CourseFaqs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCourseFaqs()
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load the FAQ.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(index, field, value) {
    setStatus("");
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function move(index, dir) {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setStatus("");
    setItems((current) => {
      const next = current.slice();
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function remove(index) {
    setStatus("");
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function add() {
    setStatus("");
    setItems((current) => [...current, { question: "", answer: "" }]);
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      setItems(await saveCourseFaqs(items));
      setStatus("FAQ saved.");
    } catch (err) {
      setError(err.message || "Could not save the FAQ.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="border border-border bg-surface p-5 md:p-8">
      <Link to="/admin/courses" className={textLinkClass}>
        All courses
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
        Frequently asked <span className="text-accent">questions</span>
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        Shown at the bottom of the Courses page. Questions left empty are not
        saved.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading</p>
      ) : (
        <ol className="mt-8 grid gap-5">
          {items.map((item, index) => (
            <li key={index} className="grid gap-3 border border-border p-4 md:p-5">
              <div>
                <label htmlFor={`faq-question-${index}`} className={labelClass}>
                  Question {index + 1}
                </label>
                <input
                  id={`faq-question-${index}`}
                  value={item.question}
                  maxLength={300}
                  placeholder="e.g. Do I get a certificate?"
                  onChange={(e) => update(index, "question", e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor={`faq-answer-${index}`} className={labelClass}>
                  Answer
                </label>
                <textarea
                  id={`faq-answer-${index}`}
                  rows={4}
                  value={item.answer}
                  maxLength={3000}
                  onChange={(e) => update(index, "answer", e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={ghostClass}
                  disabled={index === 0 || saving}
                  onClick={() => move(index, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={ghostClass}
                  disabled={index === items.length - 1 || saving}
                  onClick={() => move(index, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className={ghostClass}
                  disabled={saving}
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {error ? (
        <p role="alert" className="mt-5 text-sm text-accent">
          {error}
        </p>
      ) : null}
      {status ? (
        <p role="status" className="mt-5 text-sm text-accent">
          {status}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className={ghostClass}
          disabled={loading || saving}
          onClick={add}
        >
          Add question
        </button>
        <button type="submit" className={pillClass} disabled={loading || saving}>
          {saving ? "Saving" : "Save FAQ"}
        </button>
      </div>
    </form>
  );
}

export default CourseFaqs;
