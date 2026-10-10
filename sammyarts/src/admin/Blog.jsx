import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useContent } from "../data/content";
import { uploadImage } from "./upload";

const blank = {
  id: null,
  title: "",
  excerpt: "",
  body: "",
  author: "Sammy",
  date: new Date().toISOString().slice(0, 10),
  img: "",
  featured: false,
  slug: "",
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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

function sortedPosts(posts) {
  return [...posts].sort((a, b) => {
    const byDate = String(b.date || "").localeCompare(String(a.date || ""));
    if (byDate) return byDate;
    return Number(b.id) - Number(a.id);
  });
}

function PostList() {
  const { blogPosts, saveBlogPosts } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const posts = sortedPosts(blogPosts);
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

  async function removePost(id) {
    setSaving(true);
    setSaveError("");
    try {
      await saveBlogPosts(blogPosts.filter((post) => post.id !== id));
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
            Writing
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
            The <span className="text-accent">blog</span>
          </h1>
        </div>
        <Link to="/admin/blog/new" className={pillClass}>
          New post
        </Link>
      </div>

      <p className="mt-6 text-sm text-muted">
        <span className="font-serif text-4xl italic text-accent">
          {String(posts.length).padStart(2, "0")}
        </span>
        <span className="mt-1 block">
          {saving ? "Saving" : "Posts on the site"}
        </span>
      </p>
      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {saveError}
        </p>
      ) : null}

      <ul className="mt-10">
        {posts.length === 0 ? (
          <li className="border-t border-border py-8 text-sm text-muted">
            No posts yet.
          </li>
        ) : (
          posts.map((post, index) => (
            <li
              key={post.id}
              className="grid items-center gap-4 border-t border-border py-6 last:border-b md:grid-cols-[5rem_minmax(0,1fr)_auto]"
            >
              <Shot src={post.img} />
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                  {post.featured ? " · Featured" : ""}
                  {post.author ? ` · ${post.author}` : ""}
                  {post.date ? ` · ${post.date}` : ""}
                </p>
                <h2 className="mt-1 font-serif text-3xl italic tracking-[-0.03em] break-words">
                  <Link
                    to={`/admin/blog/${post.id}`}
                    className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {post.title}
                  </Link>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Link to={`/admin/blog/${post.id}`} className={ghostClass}>
                  Open
                </Link>
                {confirmId === post.id ? (
                  <>
                    <button
                      type="button"
                      className={pillClass}
                      disabled={saving}
                      onClick={() => removePost(post.id)}
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
                    onClick={() => setConfirmId(post.id)}
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

function PostEditor() {
  const { id } = useParams();
  const isNew = !id;
  const { blogPosts, saveBlogPosts } = useContent();
  const navigate = useNavigate();
  const existing = blogPosts.find((post) => String(post.id) === id);
  const [draft, setDraft] = useState(() =>
    existing
      ? {
          ...existing,
          date: existing.date || new Date().toISOString().slice(0, 10),
        }
      : blank,
  );
  const [titleError, setTitleError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileRef = useRef(null);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "title") setTitleError("");
  }

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

  async function onSave(e) {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setTitleError("Add a title.");
      return;
    }

    const item = {
      id: draft.id ?? Date.now(),
      title,
      excerpt: draft.excerpt.trim(),
      body: draft.body.trim(),
      author: draft.author.trim() || "Sammy",
      date: draft.date.trim() || new Date().toISOString().slice(0, 10),
      img: draft.img.trim(),
      featured: Boolean(draft.featured),
      slug: slugify(draft.slug || title) || `post-${Date.now()}`,
    };

    let next = isNew
      ? [...blogPosts, item]
      : blogPosts.map((post) => (String(post.id) === id ? item : post));

    if (item.featured) {
      next = next.map((post) =>
        post.id === item.id ? post : { ...post, featured: false },
      );
    }

    setSaving(true);
    setSaveError("");
    setTitleError("");
    try {
      await saveBlogPosts(next);
      navigate("/admin/blog", {
        state: {
          notice: isNew ? "Post published." : "Post saved.",
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
      await saveBlogPosts(blogPosts.filter((post) => String(post.id) !== id));
      navigate("/admin/blog", { state: { notice: "Post deleted." } });
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  if (!isNew && !existing) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Post</p>
        <h1 className="mt-4 font-serif text-5xl italic">
          This post is not on the site.
        </h1>
        <Link to="/admin/blog" className={`${textLinkClass} mt-8`}>
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSave}
      className="border border-border bg-surface p-5 md:p-8"
    >
      <Link to="/admin/blog" className={textLinkClass}>
        All posts
      </Link>
      <h1 className="mt-6 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
        {isNew ? "New post" : draft.title || "Edit post"}
      </h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="grid gap-5">
          {titleError || saveError ? (
            <p role="alert" className="text-sm text-accent">
              {titleError || saveError}
            </p>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="blog-title" className={labelClass}>
                Title
              </label>
              <input
                id="blog-title"
                value={draft.title}
                onChange={(e) => updateDraft("title", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="blog-author" className={labelClass}>
                Author
              </label>
              <input
                id="blog-author"
                value={draft.author}
                onChange={(e) => updateDraft("author", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="blog-date" className={labelClass}>
                Date
              </label>
              <input
                id="blog-date"
                type="date"
                value={draft.date}
                onChange={(e) => updateDraft("date", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="blog-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="blog-slug"
                value={draft.slug}
                placeholder="auto from title"
                onChange={(e) => updateDraft("slug", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(e) => updateDraft("featured", e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Featured post
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="blog-img" className={labelClass}>
              Cover image
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
          </div>
          <div>
            <label htmlFor="blog-excerpt" className={labelClass}>
              Excerpt
            </label>
            <textarea
              id="blog-excerpt"
              rows={3}
              value={draft.excerpt}
              onChange={(e) => updateDraft("excerpt", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="blog-body" className={labelClass}>
              Post
            </label>
            <textarea
              id="blog-body"
              rows={12}
              value={draft.body}
              onChange={(e) => updateDraft("body", e.target.value)}
              className={fieldClass}
              placeholder="Write the full post here."
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className={pillClass}
            >
              {saving ? "Saving" : isNew ? "Publish" : "Save post"}
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
              alt=""
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

function PostPage() {
  const { id } = useParams();
  const { ready } = useContent();
  if (!ready) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Post</p>
        <h1 className="mt-4 font-serif text-5xl italic">Loading post</h1>
      </div>
    );
  }
  return <PostEditor key={id ?? "new"} />;
}

function Blog() {
  return (
    <Routes>
      <Route index element={<PostList />} />
      <Route path="new" element={<PostPage />} />
      <Route path=":id" element={<PostPage />} />
    </Routes>
  );
}

export default Blog;
