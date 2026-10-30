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

// Seconds the marquee spends on each stat. Lower = faster.
const SECONDS_PER_STAT = 6;

// Scoped on purpose, so the animation never depends on Tailwind config.
// The marquee only runs below md (768px); from md up the track is
// `display: contents` and the stats sit in the grid exactly as before.
const marqueeCss = `
@keyframes gs-marquee {
  to { transform: translateX(-50%); }
}
@media (max-width: 767px) {
  .gs-track {
    animation: gs-marquee var(--gs-duration, 18s) linear infinite;
    will-change: transform;
  }
  .gs-viewport:hover .gs-track,
  .gs-viewport:focus-within .gs-track,
  .gs-viewport:active .gs-track {
    animation-play-state: paused;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gs-track { animation: none; }
  .gs-viewport { overflow-x: auto; }
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

  const stats = customStats ?? deriveStats(works, categories);

  // Same guard the About section uses, so a work image is never shown as a face
  const headshot =
    site?.ceo && !works.some((work) => work.img === site.ceo) ? site.ceo : "";

  return (
    <section
      aria-label="The gallery at a glance"
      className="px-5 mb-8 pb-20 md:px-10 md:pb-28"
    >
      <style>{marqueeCss}</style>

      {/*
        Mobile: the stats scroll right-to-left in an endless loop and the
        contact card is hidden. The stats are rendered twice back to back and
        the track slides by exactly half its width, so the loop is seamless.
        The second copy is aria-hidden so screen readers only hear it once.

        md and up: the track and its first group are `display: contents`, so
        the three stats and the contact card are direct grid children, like
        the reference. auto-fit drops them to two rows and then a single
        column as space runs out. The second copy is hidden.
      */}
      <div
        className="gs-viewport -mx-5 overflow-hidden md:mx-0 md:grid md:gap-x-8 md:gap-y-10 md:overflow-visible md:[grid-template-columns:var(--stats-cols)]"
        style={{
          "--stats-cols": "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
        }}
      >
        <div
          className="gs-track flex w-max md:contents"
          style={{ "--gs-duration": `${stats.length * SECONDS_PER_STAT}s` }}
        >
          <div className="flex shrink-0 gap-x-8 pr-8 md:contents">
            {stats.map((stat) => (
              <StatItem key={stat.label} stat={stat} />
            ))}
          </div>

          <div
            aria-hidden="true"
            className="gs-dupe flex shrink-0 gap-x-8 pr-8 md:hidden"
          >
            {stats.map((stat) => (
              <StatItem key={`${stat.label}-dupe`} stat={stat} />
            ))}
          </div>
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
