import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { services } from "../../data/service";
import { useContent } from "../../data/content";

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

// Back card, middle card, front card. The front card lands last.
const POSES = [
  { x: "-14%", y: 8, rotate: -8 },
  { x: "12%", y: -6, rotate: 6 },
  { x: "0%", y: 0, rotate: 0 },
];

// Used until a thumbnail is ready (or when a service has no images)
const FALLBACKS = ["bg-muted/40", "bg-text/80", "bg-accent"];

const HOVER_INTENT_MS = 60; // pointer must rest on a word this long to open it

// Cards only animate transform and opacity, so hovering never forces layout.
const cardVariants = {
  closed: {
    opacity: 0,
    scale: 0.7,
    y: 60,
    x: "0%",
    rotate: 0,
    transition: { duration: 0.18 },
  },
  open: (i) => ({
    opacity: 1,
    scale: 1,
    x: POSES[i].x,
    y: POSES[i].y,
    rotate: POSES[i].rotate,
    transition: { duration: 0.36, ease: EASE, delay: 0.03 + i * 0.05 },
  }),
};

/* ------------------------------------------------------------------ */
/* Thumbnails: shrink the big originals once, in the background.       */
/* ------------------------------------------------------------------ */

const THUMB_WIDTH = 640; // cards render around 240px, so this covers 2x screens
const THUMB_QUALITY = 0.72;
const SKIP_BELOW_BYTES = 150 * 1024; // already small, use as is

const thumbCache = new Map(); // src -> Promise<string>
const thumbReady = new Map(); // src -> string (sync lookup for remounts)

// One image at a time, each waiting for an idle moment, so the work never
// competes with scrolling or page load.
let queue = Promise.resolve();

const idle = () =>
  new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(resolve, { timeout: 1500 });
    } else {
      setTimeout(resolve, 50);
    }
  });

async function buildThumb(src) {
  try {
    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) return src;

    const blob = await response.blob();
    if (blob.size < SKIP_BELOW_BYTES || !window.createImageBitmap) return src;

    // Decodes straight to the small size, so the full bitmap is never kept
    const bitmap = await createImageBitmap(blob, {
      resizeWidth: THUMB_WIDTH,
      resizeQuality: "medium",
    });

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    bitmap.close?.();

    // JPEG because every browser can encode it (Safari ignores WebP here)
    const small = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", THUMB_QUALITY),
    );

    return small ? URL.createObjectURL(small) : src;
  } catch {
    // CORS blocked or decode failed: fall back to the original image
    return src;
  }
}

function makeThumb(src) {
  if (!thumbCache.has(src)) {
    const job = queue
      .then(idle)
      .then(() => buildThumb(src))
      .then((thumb) => {
        thumbReady.set(src, thumb);
        return thumb;
      });

    queue = job.catch(() => {});
    thumbCache.set(src, job);
  }

  return thumbCache.get(src);
}

// Returns one entry per source: the thumbnail URL, or null while it is pending.
function useThumbs(sources) {
  const key = sources.join("|");

  const [ready, setReady] = useState(() =>
    Object.fromEntries(
      sources
        .filter((s) => thumbReady.has(s))
        .map((s) => [s, thumbReady.get(s)]),
    ),
  );

  useEffect(() => {
    let alive = true;

    sources.forEach((src) => {
      makeThumb(src).then((thumb) => {
        if (alive) setReady((prev) => ({ ...prev, [src]: thumb }));
      });
    });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return sources.map((src) => ready[src] ?? null);
}

// Decode the real DOM image as soon as it loads, long before the first hover.
const warm = (el) => {
  el?.decode?.().catch(() => {});
};

/* ------------------------------------------------------------------ */

function ServiceItem({ service, sources, reduce, canHover }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const thumbs = useThumbs(sources);
  const active = open && !reduce;

  useEffect(() => () => clearTimeout(timer.current), []);

  // Only the word opens the row, and only after the pointer rests on it.
  const handleWordEnter = () => {
    if (!canHover) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), HOVER_INTENT_MS);
  };

  // Once open, the whole row (word plus stack) keeps it open until you leave.
  const handleRowLeave = () => {
    clearTimeout(timer.current);
    if (canHover) setOpen(false);
  };

  return (
    <li
      tabIndex={0}
      className={`flex flex-col items-center text-balance font-serif text-[clamp(2rem,4vw,6.5rem)] uppercase leading-none tracking-[-0.03em] outline-none transition-colors duration-300 ${
        open ? "text-text" : "text-accent"
      }`}
      onPointerLeave={handleRowLeave}
      onClick={() => !canHover && setOpen((value) => !value)}
      onFocus={(event) => {
        if (event.target.matches?.(":focus-visible")) setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {/* Image stack: always mounted. The row grows with a CSS transition
          (no JS height measuring), then the cards pop in on the compositor. */}
      {!reduce && (
        <div
          aria-hidden="true"
          className={`grid w-full transition-[grid-template-rows] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex justify-center py-6 md:py-8">
              <div className="relative h-[clamp(7rem,13vw,11rem)] w-[clamp(9.5rem,18vw,15rem)]">
                {POSES.map((_, i) => {
                  const src = thumbs.length
                    ? thumbs[(POSES.length - 1 - i) % thumbs.length]
                    : null;

                  return (
                    <MotionDiv
                      key={i}
                      custom={i}
                      variants={cardVariants}
                      initial={false}
                      animate={active ? "open" : "closed"}
                      className={`absolute inset-0 overflow-hidden rounded-md shadow-lg ${
                        src ? "" : FALLBACKS[i]
                      }`}
                    >
                      {src && (
                        <img
                          ref={warm}
                          src={src}
                          alt=""
                          decoding="async"
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </MotionDiv>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The row is shrink-wrapped, so this text is the only hover target */}
      <span className="block py-1" onPointerEnter={handleWordEnter}>
        {service.name}
      </span>
    </li>
  );
}

function ServiceRing({ className = "" }) {
  const reduce = useReducedMotion();
  const { works } = useContent();

  // Touch screens have no hover, so tapping a service toggles it instead
  const [canHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches,
  );

  if (!services.length) return null;

  return (
    <section
      className={`flex flex-col items-center pb-[10vh] text-center ${className}`}
      aria-labelledby="services-heading"
    >
      <MotionDiv
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease: EASE }}
      >
        <h2
          id="services-heading"
          className="font-serif text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.04em] text-text"
        >
          Services
        </h2>
      </MotionDiv>

      <ul className="mt-10 flex w-full flex-col items-center gap-y-8 md:mt-16 md:gap-y-14">
        {services.map((service) => (
          <ServiceItem
            key={service.name}
            service={service}
            sources={works
              .filter((work) => work.category === service.category && work.img)
              .map((work) => work.img)
              .slice(0, POSES.length)}
            reduce={reduce}
            canHover={canHover}
          />
        ))}
      </ul>
    </section>
  );
}

export default ServiceRing;
