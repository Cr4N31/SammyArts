import { Link, useParams } from "react-router-dom";
import { useContent } from "../data/content";
import AuthorLine from "../components/blog/AuthorLine";
import PostImage from "../components/blog/PostImage";

function BlogPost() {
  const { slug } = useParams();
  const { blogPosts } = useContent();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return (
      <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cream/50">
            Blog
          </p>
          <h1 className="mt-4 font-serif text-4xl italic tracking-[-0.03em] md:text-5xl">
            This post is not on the site.
          </h1>
          <Link
            to="/blog"
            className="mt-8 inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-accent"
          >
            Back to blog
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = String(post.body || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <main className="bg-brand px-5 pb-24 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex min-h-11 items-center border-b border-current pb-1 text-xs uppercase tracking-[0.2em] text-cream/60 transition-colors hover:text-accent"
        >
          All posts
        </Link>

        <p className="mt-10 text-xs text-accent">
          {post.featured ? "Featured" : "Post"}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2.25rem,6vw,4rem)] italic leading-[1.05] tracking-[-0.04em]">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-5 text-base leading-relaxed text-cream/70 md:text-lg">
            {post.excerpt}
          </p>
        ) : null}

        <AuthorLine
          author={post.author}
          date={post.date}
          className="mt-8"
        />

        <div className="mt-10 overflow-hidden rounded-sm md:mt-14">
          <PostImage
            src={post.img}
            alt={post.title}
            priority
            className="aspect-[16/10]"
          />
        </div>

        <div className="mt-10 space-y-5 text-base leading-relaxed text-cream/80 md:mt-14 md:text-lg">
          {paragraphs.length ? (
            paragraphs.map((block, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {block}
              </p>
            ))
          ) : (
            <p className="text-cream/50">No post body yet.</p>
          )}
        </div>
      </article>
    </main>
  );
}

export default BlogPost;
