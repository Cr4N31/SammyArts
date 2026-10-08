import { useState } from "react";

// One work: the image, then its title and details underneath.
// `shape` is an aspect-ratio class, which is what makes the tops ragged.
function WorkCard({ work, shape, onOpen }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${work.title}`}
      className="group block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span
        className={`block w-full overflow-hidden rounded-sm bg-surface ${shape}`}
      >
        {failed ? (
          <span className="grid h-full w-full place-items-center px-2 text-center text-xs text-muted">
            {work.title}
          </span>
        ) : (
          <img
            src={work.img}
            alt={work.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
            className="block h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
      </span>

      <span className="mt-3 block text-xs font-medium text-accent">
        {work.title}
      </span>
      <span className="mt-0.5 block text-[0.7rem] leading-snug text-cream/60">
        {work.medium}, {work.year}
      </span>
    </button>
  );
}

export default WorkCard;
