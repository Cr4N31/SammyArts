import { useEffect, useRef } from "react";
import { PageTransitionLink } from "../../shared/PageTransition";
import { useContent } from "../../data/content";

const listFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/**
 * Builds the three stats from the gallery's own data, so they are always true
 * and update when works are added. To show your own figures instead (for
 * example "40+" clients), pass a `stats` prop:
 *
 *   <GalleryStats
 *     stats={[
 *       { label: "Clients", value: "40+", note: "Brands and creators across 15 countries." },
 *     ]}
 *   />
 */
function deriveStats(works, categories) {
  const years = works
    .map((work) => parseInt(work.year, 10))
    .filter(Number.isFinite);
  const latest = years.length ? Math.max(...years) : null;

  const stats = [
    {
      label: "Projects done",
      value: String(works.length),
      note: categories.length
        ? `Across ${listFormat.format(categories.map((c) => c.toLowerCase()))}.`
        : "Campaigns, brands, ads and thumbnails.",
    },
    {
      label: "Disciplines",
      value: String(categories.length),
      note: "Each one treated as its own craft, not an add-on.",
    },
  ];

  if (latest) {
    stats.push({
      label: "Latest work",
      value: String(latest),
      note: "The most recent piece added to the gallery.",
    });
  }

  return stats;
}

// Marquee speed on mobile, in pixels per second. Higher = faster.
const SPEED_PX_PER_SEC = 40;

// Scoped on purpose, so the behaviour never depends on Tailwind config.
// Below md (768px) the viewport becomes a horizontally scrollable strip
// (swipeable). From md up none of this applies and the stats sit in the grid
// exactly as before.
const marqueeCss = `
@media (max-width: 767px) {
  .gs-viewport {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  .gs-viewport::-webkit-scrollbar { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .gs-dupe { display: none; }
}
`;

function StatItem({ stat }) {
  return (
    <dl className="w-64 shrink-0 md:w-auto md:shrink">
      <dt className="text-base md:text-lg">{stat.label}</dt>
      <dd className="mt-5 font-serif text-5xl leading-none tracking-[-0.03em]">
        {stat.value}
      </dd>
      <dd className="mt-5 max-w-[14rem] text-xs leading-relaxed text-muted md:text-sm">
        {stat.note}
      </dd>
    </dl>
  );
}

function GalleryStats({ works, categories, stats: customStats }) {
  const { site } = useContent();
  const viewportRef = useRef(null);

  const stats = customStats ?? deriveStats(works, categories);

  // Same guard the About section uses, so a work image is never shown as a face
  const headshot =
    site?.ceo && !works.some((work) => work.img === site.ceo) ? site.ceo : "";

  // Mobile only: drift the strip leftwards forever. Visitors can swipe it in
  // either direction. It stops while a finger is held on it and carries on
  // as soon as the finger lifts.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    const mobile = window.matchMedia("(max-width: 767px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = 0;
    let pos = 0; // float position, because scrollLeft can round to integers
    let ready = false;

    let touching = false;
    let releasing = false; // finger just lifted, waiting for any swipe momentum to end
    let prevLeft = 0;
    let hovering = false;
    let focused = false;

    // Width of one full copy of the stats (including its trailing gap)
    const groupWidth = () => {
      const groups = el.querySelectorAll("[data-group]");
      return groups.length > 1
        ? groups[1].offsetLeft - groups[0].offsetLeft
        : 0;
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!mobile.matches || reduceMotion.matches) {
        ready = false;
        return;
      }

      const g = groupWidth();
      if (!g) return;

      // Three copies are rendered. Live in the middle one, so there is always
      // a full copy of room to swipe in either direction.
      if (!ready) {
        el.scrollLeft = g;
        pos = g;
        ready = true;
      }

      // Finger is down: hold still and follow wherever the visitor drags
      if (touching || hovering || focused) {
        pos = el.scrollLeft;
        return;
      }

      // Finger just lifted. A plain press-and-release has no momentum, so
      // this clears on the very next frame and the marquee carries on. After
      // a swipe, wait only until the flick has finished gliding.
      if (releasing) {
        const moved = Math.abs(el.scrollLeft - prevLeft) > 0.5;
        prevLeft = el.scrollLeft;
        if (moved) {
          pos = el.scrollLeft;
          return;
        }
        releasing = false;
      }

      pos += SPEED_PX_PER_SEC * dt;

      // Jump by exactly one copy to stay in the middle. The content is
      // identical, so the jump is invisible.
      while (pos >= g * 2) pos -= g;
      while (pos < g) pos += g;

      el.scrollLeft = pos;
    };

    const onTouchStart = () => {
      touching = true;
      releasing = false;
    };
    const onTouchEnd = () => {
      touching = false;
      releasing = true;
      prevLeft = el.scrollLeft;
    };
    const onPointerEnter = (e) => {
      if (e.pointerType === "mouse") hovering = true;
    };
    const onPointerLeave = (e) => {
      if (e.pointerType === "mouse") hovering = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };

    raf = requestAnimationFrame(tick);

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [stats.length]);

  return (
    <section
      aria-label="The gallery at a glance"
      className="px-5 mb-8 pb-20 md:px-10 md:pb-28"
    >
      <style>{marqueeCss}</style>

      {/*
        Mobile: the stats drift right-to-left in an endless loop and the
        contact card is hidden. The strip is a normal horizontally scrollable
        container, so visitors can swipe it either way, and the script above
        pauses the drift while a finger is down. The stats are rendered three
        times back to back so there is always content on both sides; the extra
        copies are aria-hidden so screen readers only hear the stats once.

        md and up: the first group is `display: contents`, so the three stats
        and the contact card are direct grid children, like the reference.
        auto-fit drops them to two rows and then a single column as space runs
        out. The extra copies are hidden.
      */}
      <div
        ref={viewportRef}
        className="gs-viewport -mx-5 md:mx-0 md:grid md:gap-x-8 md:gap-y-10 md:[grid-template-columns:var(--stats-cols)]"
        style={{
          "--stats-cols": "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
        }}
      >
        <div className="flex w-max md:contents">
          {[0, 1, 2].map((copy) => (
            <div
              key={copy}
              data-group
              aria-hidden={copy === 0 ? undefined : "true"}
              className={
                copy === 0
                  ? "flex shrink-0 gap-x-8 pr-8 md:contents"
                  : "gs-dupe flex shrink-0 gap-x-8 pr-8 md:hidden"
              }
            >
              {stats.map((stat) => (
                <StatItem key={`${copy}-${stat.label}`} stat={stat} />
              ))}
            </div>
          ))}
        </div>

        {/* Contact card (desktop only) */}
        <div className="hidden w-full max-w-[26rem] items-center gap-5 self-center rounded-2xl border border-border bg-surface p-5 md:flex">
          <span
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-raised font-serif text-2xl text-accent"
            style={{ width: "5rem", height: "5rem" }}
          >
            {headshot ? (
              <img
                src={headshot}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full select-none object-cover"
                style={{ objectPosition: "50% 20%" }}
              />
            ) : (
              "S"
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug">
              Got a project?
              <br />
              Talk to Samuel.
            </p>

            <PageTransitionLink
              to="/contact"
              className="mt-3 flex h-9 w-full items-center justify-center rounded-full border border-border px-4 text-sm transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Get in touch
            </PageTransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GalleryStats;
