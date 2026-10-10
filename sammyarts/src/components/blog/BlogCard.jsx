import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import PostImage from "./PostImage";
import AuthorLine from "./AuthorLine";

const EASE = [0.16, 1, 0.3, 1];
const MotionArticle = motion.article;

// Image on top, then title, excerpt, and author. The whole card is one link.
function BlogCard({ post }) {
  const reduce = useReducedMotion();

  return (
    <MotionArticle
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className="overflow-hidden rounded-sm">
          <PostImage
            src={post.img}
            alt={post.title}
            className="aspect-[3/2] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        <h3 className="mt-5 font-serif text-2xl italic leading-tight tracking-[-0.02em] transition-colors duration-300 group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream/60">
          {post.excerpt}
        </p>

        <AuthorLine author={post.author} date={post.date} className="mt-5" />
      </Link>
    </MotionArticle>
  );
}

export default BlogCard;
