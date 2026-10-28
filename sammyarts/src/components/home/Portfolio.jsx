import { motion, useReducedMotion } from "motion/react";
import { PageTransitionLink } from "../../shared/PageTransition";
import { useContent } from "../../data/content";

const EASE = [0.16, 1, 0.3, 1];
const FEATURED_WORKS_LIMIT = 6;
const MotionArticle = motion.article;

const Arrow = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5 shrink-0"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </svg>
);

const TagIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5 shrink-0"
    aria-hidden="true"
  >
    <path d="M3 12V4h8l10 10-8 8L3 12z" />
    <circle cx="7.5" cy="8.5" r="1" />
  </svg>
);

const WorkCard = ({ item, index, reduce }) => (
  <MotionArticle
    initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{
      duration: 0.9,
      delay: reduce ? 0 : (index % 3) * 0.08,
      ease: EASE,
    }}
    className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-border transition-colors duration-300 hover:ring-accent/40"
  >
    <div className="overflow-hidden bg-raised">
      <img
        src={item.img}
        alt={item.title}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full select-none object-contain transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>

    <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
      <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-lg leading-[1.3] tracking-[-0.01em] md:text-xl">
        {item.title}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-4">
        <ul className="min-w-0 space-y-2 text-xs text-muted">
          {item.client ? (
            <li className="flex items-center gap-2">
              <UserIcon />
              <span className="truncate">{item.client}</span>
            </li>
          ) : null}
          {item.category ? (
            <li className="flex items-center gap-2">
              <TagIcon />
              <span className="truncate">{item.category}</span>
            </li>
          ) : null}
        </ul>

        {/* Stretched link: the after: layer makes the whole card clickable */}
        <PageTransitionLink
          to="/gallery"
          className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-brand transition-colors duration-300 after:absolute after:inset-0 hover:bg-accent-hover active:bg-accent-pressed"
        >
          <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
          <span className="sr-only">View {item.title}</span>
        </PageTransitionLink>
      </div>
    </div>
  </MotionArticle>
);

function Portfolio() {
  const { works: allWorks, ready } = useContent();
  const reduce = useReducedMotion();
  const works = allWorks.slice(0, FEATURED_WORKS_LIMIT);

  if (!works.length) {
    return (
      <section id="gallery" className="px-5 py-20 text-text md:px-10 md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
          Gallery
        </p>
        <h2 className="font-serif text-[clamp(2.75rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.05em]">
          A few of our artistic works
        </h2>
        {ready ? (
          <p className="mt-6 text-sm text-muted">No pieces yet.</p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      id="gallery"
      className="relative overflow-hidden py-20 text-text md:py-32"
    >
      <div className="px-5 md:px-10">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
            Gallery
          </p>
          <h2 className="font-serif text-[clamp(2.75rem,8vw,6rem)] leading-[0.95] tracking-[-0.05em]">
            A few of our <span>designs</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {works.map((item, i) => (
            <WorkCard key={item.id} item={item} index={i} reduce={reduce} />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <PageTransitionLink
            to="/gallery"
            className="border-b border-accent text-lg font-medium text-accent transition-colors hover:border-accent-hover hover:text-accent-hover"
          >
            View more projects &rarr;
          </PageTransitionLink>
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
