import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

// Used when a service has no images yet
const FALLBACKS = ["bg-muted/40", "bg-text/80", "bg-accent"];

// Fetch and decode each image once, ahead of the first hover.
// Keeping a reference stops the browser from discarding the decoded copy.
const preloaded = new Map();

function preload(src) {
  if (preloaded.has(src)) return;

  const img = new Image();
  img.src = src;
  img.decode?.().catch(() => {});
  preloaded.set(src, img);
}

function ServiceItem({ service, images, reduce, canHover }) {
  const [open, setOpen] = useState(false);
  const showExtras = open && !reduce;

  return (
    <li
      tabIndex={0}
      className={`flex w-full flex-col items-center text-balance font-serif text-[clamp(2rem,6vw,6.5rem)] uppercase leading-none tracking-[-0.03em] outline-none transition-colors duration-300 ${
        open ? "text-text" : "text-accent"
      }`}
      onPointerEnter={() => canHover && setOpen(true)}
      onPointerLeave={() => canHover && setOpen(false)}
      onClick={() => !canHover && setOpen((value) => !value)}
      onFocus={(event) => {
        if (event.target.matches?.(":focus-visible")) setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {/* Image stack: the row grows to make room, then the cards pop in */}
      <AnimatePresence initial={false}>
        {showExtras && (
          <MotionDiv
            key="stack"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="flex w-full justify-center overflow-hidden"
            aria-hidden="true"
          >
            <div className="py-6 md:py-8">
              <div className="relative h-[clamp(7rem,13vw,11rem)] w-[clamp(9.5rem,18vw,15rem)]">
                {POSES.map((pose, i) => {
                  const src = images.length
                    ? images[(POSES.length - 1 - i) % images.length]
                    : null;

                  return (
                    <motion.div
                      key={i}
                      initial={{
                        opacity: 0,
                        scale: 0.7,
                        y: 60,
                        x: "0%",
                        rotate: 0,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: pose.x,
                        y: pose.y,
                        rotate: pose.rotate,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.85,
                        y: 24,
                        transition: { duration: 0.18 },
                      }}
                      transition={{
                        duration: 0.36,
                        ease: EASE,
                        delay: 0.03 + i * 0.05,
                      }}
                      className={`absolute inset-0 overflow-hidden rounded-md shadow-xl will-change-transform ${
                        src ? "" : FALLBACKS[i]
                      }`}
                    >
                      {src && (
                        <img
                          src={src}
                          alt=""
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <span className="block">{service.name}</span>
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

  // Only the three images each stack uses, kept stable between renders
  const imagesByService = useMemo(
    () =>
      services.map((service) =>
        works
          .filter((work) => work.category === service.category && work.img)
          .map((work) => work.img)
          .slice(0, POSES.length),
      ),
    [works],
  );

  // Warm the cache when the browser is idle so it doesn't compete with page load
  useEffect(() => {
    const run = () => imagesByService.flat().forEach(preload);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(run, 500);
    return () => clearTimeout(id);
  }, [imagesByService]);

  if (!services.length) return null;

  return (
    <section
      className={`flex flex-col items-center pb-[25vh] text-center ${className}`}
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
          what I’m good at!
        </h2>
      </MotionDiv>

      <ul className="mt-10 flex w-full flex-col items-center gap-y-8 md:mt-16 md:gap-y-14">
        {services.map((service, index) => (
          <ServiceItem
            key={service.name}
            service={service}
            images={imagesByService[index]}
            reduce={reduce}
            canHover={canHover}
          />
        ))}
      </ul>
    </section>
  );
}

export default ServiceRing;
