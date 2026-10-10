import { useState } from "react";
import { blogPosts } from "../data/blogData";
import BlogFeatured from "../components/blog/BlogFeatured";
import BlogGrid from "../components/blog/BlogGrid";

// How many posts appear at first, and how many each press of the button adds
const PAGE_SIZE = 6;

function Blog() {
  const featured = blogPosts.find((post) => post.featured) ?? blogPosts[0];
  const recent = blogPosts.filter((post) => post.id !== featured.id);

  const [count, setCount] = useState(PAGE_SIZE);
  const visible = recent.slice(0, count);
  const hasMore = count < recent.length;

  return (
    <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <BlogFeatured post={featured} />

        {/* Inset to line up with the featured card's text */}
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
            <BlogGrid posts={visible} />
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
