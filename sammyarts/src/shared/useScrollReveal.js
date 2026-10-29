import { useLayoutEffect } from "react";

const DURATION = 900; // ms
const STAGGER = 90; // ms between items that appear together
const MAX_STEPS = 6; // caps the stagger so a big batch never drags
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const FROM = "translate3d(0, 56px, 0) scale(0.96)";

/**
 * Reveals every [data-reveal] element inside the container as it scrolls into
 * view, so cards rise and settle into place one after another.
 *
 * Usage:
 *   const ref = useRef(null);
 *   useScrollReveal(ref, { enabled: !reduce, watch: items.length });
 *   <section ref={ref}> ... <div data-reveal /> ... </section>
 *
 * `watch` is any value that changes when the set of [data-reveal] elements
 * changes (for example the item count), so the hook picks up late content.
 *
 * Performance notes:
 * - Only opacity and transform are animated, both run on the compositor.
 * - Uses the Web Animations API, so there is no React state, no re-renders and
 *   no per-frame JavaScript.
 * - One IntersectionObserver per container. Each element is observed once,
 *   then released as soon as it has been revealed.
 * - Nothing is left on an element after its animation ends, so hover styles
 *   and transitions behave exactly as before.
 */
export function useScrollReveal(containerRef, { enabled = true, watch } = {}) {
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!enabled || !container) return undefined;
    if (typeof container.animate !== "function") return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const targets = Array.from(container.querySelectorAll("[data-reveal]"));

    if (!targets.length) return undefined;

    // Hide before first paint so nothing flashes in and then jumps.
    targets.forEach((el) => {
      el.style.opacity = "0";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        // Items that arrive together (a whole row, or the first screen) are
        // staggered top to bottom, then left to right.
        const batch = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left,
          );

        batch.forEach((entry, i) => {
          const el = entry.target;

          observer.unobserve(el);

          el.animate(
            [
              { opacity: 0, transform: FROM },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: DURATION,
              delay: Math.min(i, MAX_STEPS) * STAGGER,
              easing: EASE,
              // Holds the hidden state during the delay, then lets go
              fill: "backwards",
            },
          );

          // The animation now owns the hidden state, so drop the inline style.
          el.style.opacity = "";
        });
      },
      // Reveal slightly after an item enters, so the motion is actually seen
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      targets.forEach((el) => {
        el.style.opacity = "";
      });
    };
  }, [containerRef, enabled, watch]);
}
