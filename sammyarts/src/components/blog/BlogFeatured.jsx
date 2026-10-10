import { Link } from "react-router-dom";
import PostImage from "./PostImage";

const Arrow = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// The large card at the top: full width image, title over a dark fade
function BlogFeatured({ post }) {
  return (
    <section aria-label="Featured post">
      <Link
        to={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-sm bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <PostImage
          src={post.img}
          alt={post.title}
          priority
          className="aspect-[4/5] transition-transform duration-1000 ease-out group-hover:scale-[1.02] md:aspect-[16/8]"
        />

        {/* Fade so the text stays readable on any image */}
        <div className="absolute inset-0 bg-linear-to-t from-brand/95 via-brand/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 pr-20 md:p-12 md:pr-28">
          <p className="text-xs text-accent">Featured</p>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(2rem,5vw,4rem)] italic leading-[1] tracking-[-0.04em] text-cream">
            {post.title}
          </h2>
          <p className="mt-4 hidden max-w-xl text-sm leading-relaxed text-cream/70 md:block">
            {post.excerpt}
          </p>
        </div>

        <span className="absolute bottom-6 right-6 grid h-11 w-11 place-items-center rounded-full border border-accent/40 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-brand md:bottom-12 md:right-12 md:h-14 md:w-14">
          <Arrow />
        </span>
      </Link>
    </section>
  );
}

export default BlogFeatured;
