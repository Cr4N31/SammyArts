import { useEffect, useRef, useState } from "react";
import { Link, Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useContent } from "../data/content";
import { isAuthed, login, logout } from "./gate";
import { uploadImage } from "./upload";

const blank = { id: null, title: "", desc: "", img: "" };

const labelClass = "mb-2 block text-xs uppercase tracking-[0.2em] text-muted";

const fieldClass =
  "w-full border border-border bg-bg px-3 py-3 text-base text-text outline-none transition-colors duration-300 focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none";

const pillClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const ghostClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-bg/80 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors duration-300 hover:border-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

const textLinkClass =
  "inline-flex min-h-11 cursor-pointer items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function Shot({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="grid h-16 w-20 place-items-center border border-dashed border-border bg-surface/70 text-xs text-muted">
        No image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-16 w-20 border border-border object-cover"
    />
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  multiline = false,
  type = "text",
  autoFocus = false,
  autoComplete,
  announce = false,
}) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy =
    [hintId, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const Tag = multiline ? "textarea" : "input";

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <Tag
        id={id}
        {...(multiline ? { rows: 4 } : { type, autoComplete })}
        value={value}
        autoFocus={autoFocus}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={fieldClass}
      />
      {hint ? (
        <p id={hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role={announce ? "alert" : undefined}
          className="mt-2 text-sm text-accent"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Problem({ titleError, saveError }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, [titleError, saveError]);

  if (!titleError && !saveError) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="form-error-title"
      className="border border-accent bg-raised px-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <h2 id="form-error-title" className="font-serif text-2xl italic">
        There is a problem
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
        {titleError ? (
          <li>
            <a href="#work-title" className="text-accent underline underline-offset-4">
              {titleError}
            </a>
          </li>
        ) : null}
        {saveError ? <li className="text-accent">{saveError}</li> : null}
      </ul>
    </div>
  );
}

function SignIn({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    if (login(password)) onSuccess();
    else setWrong(true);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="border-b border-border px-5 py-16 md:px-10 lg:border-b-0 lg:border-r lg:py-28">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Admin</p>
        <h1 className="mt-4 max-w-md font-serif text-6xl italic leading-[0.95] tracking-[-0.04em] md:text-8xl">
          Sammy<span className="text-accent">Arts</span>
        </h1>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted md:text-base">
          Add a project, change one, or take it off the site.
        </p>
      </section>

      <section className="flex items-center px-5 py-16 md:px-10">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <h2 className="font-serif text-5xl italic tracking-[-0.04em]">
            Sign in
          </h2>
          <div className="mt-8">
            <TextField
              id="admin-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              autoFocus
              announce
              value={password}
              error={wrong ? "That password is wrong." : ""}
              onChange={(e) => {
                setPassword(e.target.value);
                setWrong(false);
              }}
            />
          </div>
          <button type="submit" className={`${pillClass} mt-8`}>
            Enter
          </button>
        </form>
      </section>
    </main>
  );
}

function Frame({ onLogout }) {
  return (
    <main className="min-h-screen">
      <header className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <Link
          to="/admin"
          className="font-serif text-3xl italic tracking-[-0.04em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Sammy<span className="text-accent">Arts</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-6">
          <Link to="/admin" className={textLinkClass}>
            Projects
          </Link>
          <Link to="/" className={textLinkClass}>
            View site
          </Link>
          <button type="button" onClick={onLogout} className={ghostClass}>
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <Outlet />
      </div>
    </main>
  );
}

function titleFromFile(name) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base || "Untitled";
}

function PieceList() {
  const { works, saveWorks } = useContent();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileRef = useRef(null);
  const uploadTarget = useRef(null);

  function chooseFile(id) {
    uploadTarget.current = id;
    fileRef.current?.click();
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const target = uploadTarget.current;
    setSaving(true);
    setSaveError("");
    try {
      const url = await uploadImage(file);
      const next =
        target == null
          ? [
              ...works,
              {
                id: Date.now(),
                title: titleFromFile(file.name),
                desc: "",
                img: url,
              },
            ]
          : works.map((work) =>
              work.id === target ? { ...work, img: url } : work,
            );
      await saveWorks(next);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function move(index, dir) {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= works.length) return;
    const next = works.slice();
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setSaving(true);
    setSaveError("");
    try {
      await saveWorks(next);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gallery</p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
            The <span className="text-accent">projects</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onFile}
          />
          <button
            type="button"
            className={pillClass}
            disabled={saving}
            onClick={() => chooseFile(null)}
          >
            {saving ? "Uploading" : "Upload project"}
          </button>
          <Link to="/admin/new" className={ghostClass}>
            New project
          </Link>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        <span className="font-serif text-4xl italic text-accent">
          {String(works.length).padStart(2, "0")}
        </span>
        <span className="mt-1 block">{saving ? "Saving" : "Projects on the site"}</span>
      </p>
      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {saveError}
        </p>
      ) : null}

      <ul className="mt-10">
        {works.length === 0 ? (
          <li className="border-t border-border py-8 text-sm text-muted">
            No projects yet.
          </li>
        ) : (
          works.map((work, index) => (
            <li
              key={work.id}
              className="grid items-center gap-4 border-t border-border py-6 last:border-b md:grid-cols-[5rem_minmax(0,1fr)_auto]"
            >
              <Shot src={work.img} />
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-serif text-3xl italic tracking-[-0.03em] break-words">
                  <Link
                    to={`/admin/${work.id}`}
                    className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {work.title}
                  </Link>
                </h2>
                {work.desc ? (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted break-words">
                    {work.desc}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <button
                  type="button"
                  className={ghostClass}
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || saving}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={ghostClass}
                  onClick={() => move(index, 1)}
                  disabled={index === works.length - 1 || saving}
                >
                  Down
                </button>
                <button
                  type="button"
                  className={ghostClass}
                  disabled={saving}
                  onClick={() => chooseFile(work.id)}
                >
                  Upload
                </button>
                <Link to={`/admin/${work.id}`} className={ghostClass}>
                  Open
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function PiecePage() {
  const { id } = useParams();
  return <PieceEditor key={id ?? "new"} />;
}

function PieceEditor() {
  const { id } = useParams();
  const isNew = !id;
  const { works, saveWorks } = useContent();
  const navigate = useNavigate();
  const existing = works.find((work) => String(work.id) === id);
  const [draft, setDraft] = useState(() =>
    existing ? { ...existing } : blank,
  );
  const [titleError, setTitleError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileRef = useRef(null);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setSaveError("");
    try {
      const url = await uploadImage(file);
      updateDraft("img", url);
      setImgFailed(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "title") setTitleError("");
  }

  async function onSave(e) {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setTitleError("Add a title.");
      setSaveError("");
      return;
    }

    const item = {
      id: draft.id ?? Date.now(),
      title,
      desc: draft.desc.trim(),
      img: draft.img.trim(),
    };
    const next = isNew
      ? [...works, item]
      : works.map((work) => (String(work.id) === id ? item : work));

    setSaving(true);
    setSaveError("");
    setTitleError("");
    try {
      await saveWorks(next);
      if (isNew) navigate(`/admin/${item.id}`);
      else setDraft(item);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    setSaveError("");
    try {
      await saveWorks(works.filter((work) => String(work.id) !== id));
      navigate("/admin");
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  if (!isNew && !existing) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Project</p>
        <h1 className="mt-4 font-serif text-5xl italic">
          This project is not on the site.
        </h1>
        <Link to="/admin" className={`${textLinkClass} mt-8`}>
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="border border-border bg-surface p-5 md:p-8">
      <Link to="/admin" className={textLinkClass}>
        All projects
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
        {isNew ? "New project" : draft.title || "Edit project"}
      </h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="grid gap-5">
          <Problem titleError={titleError} saveError={saveError} />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              id="work-title"
              label="Title"
              value={draft.title}
              error={titleError}
              onChange={(e) => updateDraft("title", e.target.value)}
            />
            <div>
              <label htmlFor="work-img" className={labelClass}>
                Image
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={onFile}
              />
              <button
                type="button"
                className={ghostClass}
                disabled={uploading || saving}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Uploading" : "Upload image"}
              </button>
              <input
                id="work-img"
                value={draft.img}
                placeholder="Or paste a link"
                onChange={(e) => {
                  updateDraft("img", e.target.value);
                  setImgFailed(false);
                }}
                className={`${fieldClass} mt-3`}
              />
            </div>
          </div>
          <TextField
            id="work-desc"
            label="Description"
            multiline
            value={draft.desc}
            onChange={(e) => updateDraft("desc", e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving || uploading} className={pillClass}>
              {saving ? "Saving" : "Save project"}
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
        <div className="aspect-[4/3] border border-dashed border-border bg-raised">
          {draft.img && !imgFailed ? (
            <img
              src={draft.img}
              alt={draft.title ? `Preview of ${draft.title}` : "Image preview"}
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted">
              No image
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function Admin() {
  const [authed, setAuthed] = useState(isAuthed);

  if (!authed) return <SignIn onSuccess={() => setAuthed(true)} />;

  return (
    <Routes>
      <Route
        element={
          <Frame
            onLogout={() => {
              logout();
              setAuthed(false);
            }}
          />
        }
      >
        <Route index element={<PieceList />} />
        <Route path="new" element={<PiecePage />} />
        <Route path=":id" element={<PiecePage />} />
      </Route>
    </Routes>
  );
}

export default Admin;
