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
      {/*
        The three stats and the contact card share one row, like the reference.
        auto-fit drops them to two rows and then a single column as space runs
        out, so no breakpoints are needed. The column template is an inline
        style on purpose, so the structure never depends on which Tailwind
        classes happen to have been generated.
      */}
      <div
        className="grid gap-x-8 gap-y-10"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
        }}
      >
        {stats.map((stat) => (
          <dl key={stat.label}>
            <dt className="text-base md:text-lg">{stat.label}</dt>
            <dd className="mt-5 font-serif text-5xl leading-none tracking-[-0.03em]">
              {stat.value}
            </dd>
            <dd className="mt-5 max-w-[14rem] text-xs leading-relaxed text-muted md:text-sm">
              {stat.note}
            </dd>
          </dl>
        ))}

        {/* Contact card */}
        <div className="flex w-full max-w-[26rem] items-center gap-5 self-center rounded-2xl border border-border bg-surface p-5">
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
