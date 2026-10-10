import { useState } from "react";
import { useContent } from "../data/content";
import BlogFeatured from "../components/blog/BlogFeatured";
import BlogGrid from "../components/blog/BlogGrid";

const PAGE_SIZE = 6;

function Blog() {
  const { blogPosts } = useContent();
  const posts = [...blogPosts].sort((a, b) => {
    const byDate = String(b.date || "").localeCompare(String(a.date || ""));
    if (byDate) return byDate;
    return Number(b.id) - Number(a.id);
  });
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const recent = featured
    ? posts.filter((post) => post.id !== featured.id)
    : [];

  const [count, setCount] = useState(PAGE_SIZE);
  const visible = recent.slice(0, count);
  const hasMore = count < recent.length;

  if (!blogPosts.length) {
    return (
      <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-cream/60">No posts yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-6xl">
        {featured ? <BlogFeatured post={featured} /> : null}

        <section
          aria-labelledby="recent-posts"
          className="mt-20 md:mt-28 md:px-12"
        >
          <h2
            id="recent-posts"
            className="font-serif text-3xl italic tracking-[-0.03em] md:text-4xl"
          >
            Recent posts
          </h2>

          <div className="mt-10 md:mt-14">
            {visible.length ? (
              <BlogGrid posts={visible} />
            ) : (
              <p className="text-sm text-cream/60">No other posts yet.</p>
            )}
          </div>

          {hasMore && (
            <div className="mt-16 flex justify-center md:mt-20">
              <button
                type="button"
                onClick={() => setCount((c) => c + PAGE_SIZE)}
                className="rounded-sm bg-accent px-5 py-2 text-xs font-medium text-brand transition-colors duration-300 hover:bg-accent-hover"
              >
                Load more
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Blog;
