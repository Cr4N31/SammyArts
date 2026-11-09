import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useScrollReveal } from "../../shared/useScrollReveal";

const MotionDiv = motion.div;

const pad = (n) => String(n).padStart(2, "0");

// Images at or beyond this width/height ratio get a full-width row.
const WIDE_RATIO = 1.7;
// Used until (or if) an image's real size is known.
const FALLBACK_RATIO = 0.8;

const FOCUSABLE =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const dockButton =
  "grid h-11 min-w-9 place-items-center px-2 transition-opacity duration-200 hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// Measures the natural pixel size of every image so the masonry can be
// balanced and each image can be capped at its original resolution.
function useImageSizes(srcs, enabled) {
  const [state, setState] = useState({ key: "", sizes: {} });
  const key = srcs.join("\n");

  useEffect(() => {
    if (!enabled || !key) return;

    let cancelled = false;

    Promise.all(
      key.split("\n").map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();

            img.onload = () =>
              resolve([src, { w: img.naturalWidth, h: img.naturalHeight }]);
            img.onerror = () => resolve([src, null]);
            img.src = src;
          }),
      ),
    ).then((entries) => {
      if (cancelled) return;

      setState({
        key,
        sizes: Object.fromEntries(entries.filter(([, size]) => size)),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  return { sizes: state.sizes, ready: !key || state.key === key };
}

function useColumnCount() {
  const query = "(min-width: 768px)";

  const [count, setCount] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(query).matches ? 2 : 1,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setCount(mq.matches ? 2 : 1);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  return count;
}

// Places each item, in order, into whichever column is currently shortest.
function toColumns(items, count) {
  const columns = Array.from({ length: count }, () => ({
    items: [],
    height: 0,
  }));

  items.forEach((item) => {
    const target = columns.reduce((shortest, col) =>
      col.height < shortest.height - 0.001 ? col : shortest,
    );

    target.items.push(item);
    target.height += 1 / item.ratio;
  });

  return columns.map((col) => col.items);
}

// First image is the hero. Wide images break the masonry into a full-width
// row, and everything between them is a balanced masonry group.
function buildLayout(images, sizes, columnCount) {
  const describe = (src, number) => {
    const size = sizes[src] || null;

    return {
      src,
      number,
      size,
      ratio: size ? size.w / size.h : FALLBACK_RATIO,
    };
  };

  const [heroSrc, ...rest] = images;
  const blocks = [];
  let group = null;

  rest.forEach((src, i) => {
    const item = describe(src, i + 2);

    if (item.ratio >= WIDE_RATIO) {
      group = null;
      blocks.push({ type: "full", item });
      return;
    }

    if (!group) {
      group = { type: "grid", items: [] };
      blocks.push(group);
    }

    group.items.push(item);
  });

  return {
    hero: heroSrc ? describe(heroSrc, 1) : null,
    blocks: blocks.map((block) =>
      block.type === "grid"
        ? { type: "grid", columns: toColumns(block.items, columnCount) }
        : block,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Gallery tile                                                               */
/* -------------------------------------------------------------------------- */

function Tile({ item, total, title, eager }) {
  const { src, number, size } = item;

  return (
    <figure
      data-reveal
      className="relative w-full bg-surface"
      style={size ? { maxWidth: size.w } : undefined}
    >
      <img
        src={src}
        alt={`${title}, image ${number} of ${total}`}
        width={size?.w}
        height={size?.h}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="block h-auto w-full select-none"
      />

      <figcaption
        aria-hidden="true"
        className="absolute left-0 top-0 flex items-baseline gap-1.5  px-3 py-2 text-lg tabular-nums text-text"
      >
        <span>{pad(number)}</span>
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Project details overlay                                                    */
/* -------------------------------------------------------------------------- */

// Optional data this overlay reads from a work:
//   work.sections   [{ heading, body }]  body is a string or an array of paragraphs
//   work.services   string[]             shown as "Scope of work"
//   work.credits    [{ role, name }]     name can be a string or an array
//   work.location   string               shown before the year
//   work.link       string               optional external link
// Without sections, work.desc is split into paragraphs.
function DetailsPanel({ work, open, onClose, panelRef, closeRef }) {
  const reduce = useReducedMotion();

  const services = Array.isArray(work.services)
    ? work.services.filter(Boolean)
    : [];
  const credits = Array.isArray(work.credits)
    ? work.credits.filter((credit) => credit?.name)
    : [];

  const facts = [
    ["Client", work.client],
    ["Discipline", work.category],
    ["Medium", work.medium],
    ["Scope of work", services.join(", ")],
    ...credits.map(({ role, name }) => [
      role,
      Array.isArray(name) ? name.join(", ") : name,
    ]),
  ].filter(([label, value]) => label && value);

  const footnote = [work.location, work.year].filter(Boolean).join(", ");
  const link = work.link || work.url;

  const sections = (
    Array.isArray(work.sections) && work.sections.length
      ? work.sections
      : [{ body: work.desc }]
  )
    .map((section) => ({
      heading: section.heading,
      paragraphs: (Array.isArray(section.body)
        ? section.body
        : String(section.body || "").split(/\n{2,}/)
      ).filter(Boolean),
    }))
    .filter((section) => section.heading || section.paragraphs.length);

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          key="details"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title}, project details`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="absolute inset-0 z-40 flex flex-col bg-brand text-text"
        >
          {/* Scrollable details. Native scrolling (wheel, trackpad, touch,
              scrollbar). data-lenis-prevent keeps smooth-scroll libraries
              from intercepting wheel events here. */}
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
          >
            <div className="grid gap-12 px-5 pb-16 pt-10 md:grid-cols-12 md:gap-x-6 md:px-10 md:pb-24 md:pt-14">
              {/* Facts */}
              <div className="md:col-span-3">
                {facts.length > 0 && (
                  <dl className="space-y-5 text-sm leading-snug">
                    {facts.map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-medium">{label}</dt>
                        <dd className="mt-1 text-muted">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {footnote && (
                  <p className="mt-8 text-sm text-muted">{footnote}</p>
                )}

                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-block text-sm underline underline-offset-4 transition-opacity duration-200 hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                  >
                    Visit project
                  </a>
                )}
              </div>

              {/* Written sections */}
              <div className="md:col-span-5 md:col-start-6">
                {sections.length ? (
                  sections.map((section, i) => (
                    <section
                      key={section.heading || i}
                      className="mt-14 first:mt-0"
                    >
                      {section.heading && (
                        <h2 className="text-xl font-medium leading-snug">
                          {section.heading}
                        </h2>
                      )}

                      <div
                        className={`space-y-3 text-sm leading-relaxed ${
                          section.heading ? "mt-4" : ""
                        }`}
                      >
                        {section.paragraphs.map((text, p) => (
                          <p key={p} className="whitespace-pre-line">
                            {text}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <p className="font-[family-name:Montserrat] text-sm leading-relaxed">
                    <span>
                      No statement. The work will have to speak for itself.
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar: project name and close */}
          <div className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-border px-5 md:px-10">
            <span aria-hidden="true" />

            <p className="max-w-[50vw] truncate text-sm">{work.title}</p>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className={`${dockButton} justify-self-end`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Viewer                                                                     */
/* -------------------------------------------------------------------------- */

function Viewer({ works, open, index, onClose, onStep }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const detailsRef = useRef(null);
  const detailsCloseRef = useRef(null);
  const detailsTriggerRef = useRef(null);
  const wasDetailsOpen = useRef(false);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const reduce = useReducedMotion();
  const columnCount = useColumnCount();
  const work = works[index];

  const images = useMemo(
    () =>
      work
        ? [...new Set([work.img, ...(work.caseStudyImages || [])])].filter(
            Boolean,
          )
        : [],
    [work],
  );

  const { sizes, ready } = useImageSizes(images, open);

  const layout = useMemo(
    () => buildLayout(images, sizes, columnCount),
    [images, sizes, columnCount],
  );

  // Reset the scroll position when opening or switching projects.
  useLayoutEffect(() => {
    if (!open || !scrollRef.current) return;

    scrollRef.current.scrollTop = 0;
  }, [work?.id, open]);

  // Always start a project with the details overlay closed.
  useEffect(() => {
    setDetailsOpen(false);
  }, [work?.id, open]);

  // Reveal tiles as they enter the scroll container. The tiles only mount
  // once image sizes are known, so `ready` is part of the watch key.
  useScrollReveal(scrollRef, {
    enabled: open && !reduce,
    watch: open ? `${work?.id}:${ready ? "ready" : "pending"}` : "closed",
  });

  // Lock background scrolling and manage focus.
  useEffect(() => {
    if (!open) return;

    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open]);

  // Move focus into the details overlay, and back to its trigger on close.
  useEffect(() => {
    if (detailsOpen) {
      detailsCloseRef.current?.focus();
    } else if (wasDetailsOpen.current) {
      detailsTriggerRef.current?.focus();
    }

    wasDetailsOpen.current = detailsOpen;
  }, [detailsOpen]);

  // Keyboard navigation and focus trapping.
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (detailsOpen) {
          setDetailsOpen(false);
        } else {
          onClose();
        }

        return;
      }

      if (!detailsOpen && works.length > 1) {
        if (e.key === "ArrowRight") {
          onStep(1);
          return;
        }

        if (e.key === "ArrowLeft") {
          onStep(-1);
          return;
        }
      }

      if (e.key !== "Tab") return;

      // While the overlay is open, keep focus inside it.
      const root = detailsOpen ? detailsRef.current : dialogRef.current;
      const nodes = root?.querySelectorAll(FOCUSABLE);

      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, detailsOpen, onClose, onStep, works.length]);

  if (!work) return null;

  const total = images.length;

  const meta = [
    ["Client", work.client],
    ["Discipline", work.category],
    ["Medium", work.medium],
    ["Year", work.year],
  ].filter(([, value]) => value);

  const others = [1, 2, 3]
    .map((delta) => ({
      delta,
      item: works[(index + delta) % works.length],
    }))
    .filter(
      ({ item }, i, all) =>
        item &&
        item.id !== work.id &&
        all.findIndex((other) => other.item.id === item.id) === i,
    );

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          key="viewer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={[work.title, work.medium, work.year]
            .filter(Boolean)
            .join(", ")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] h-dvh overflow-hidden bg-brand text-text"
        >
          {/* Top-right floating controls */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end px-5 pt-3 md:px-10 md:pt-6">
            <div className="pointer-events-auto flex items-center text-white mix-blend-difference">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label="Previous project"
                className={dockButton}
                disabled={works.length < 2}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M19 12H5m6 6-6-6 6-6" />
                </svg>
              </button>

              <p
                aria-live="polite"
                className="px-2 text-xs tabular-nums opacity-60"
              >
                <span className="sr-only">Project </span>
                {index + 1} / {works.length}
              </p>

              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label="Next project"
                className={dockButton}
                disabled={works.length < 2}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className={`${dockButton} ml-3 text-sm`}
              >
                Close
              </button>
            </div>
          </div>

          {/* Scrollable case study. Native scrolling only (wheel, trackpad,
              touch, scrollbar). It is locked while the details panel is open
              so it can't scroll underneath it. */}
          <div
            ref={scrollRef}
            data-lenis-prevent
            className={`viewer-scrollbar absolute inset-0 z-0 min-h-0 min-w-0 overflow-x-hidden overscroll-y-contain ${
              detailsOpen ? "overflow-y-hidden" : "overflow-y-auto"
            }`}
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            <MotionDiv
              key={work.id}
              initial={{ opacity: reduce ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Intro: title and project details trigger */}
              <header className="flex flex-col gap-8 px-5 pt-24 md:flex-row md:items-start md:justify-between md:gap-12 md:px-10 md:pt-32">
                <h2 className="break-words text-balance font-serif text-[clamp(2.75rem,7vw,7rem)] leading-[0.95] tracking-[-0.04em] md:max-w-[70%]">
                  {work.title}
                </h2>

                <button
                  ref={detailsTriggerRef}
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={detailsOpen}
                  className="group inline-flex h-11 shrink-0 items-center gap-2 self-start text-sm transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:mt-2"
                >
                  Project details
                  <span
                    aria-hidden="true"
                    className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90"
                  >
                    +
                  </span>
                </button>
              </header>

              {/* Hero image (number 01) */}
              <div className="mt-10 md:mt-16">
                {!ready ? (
                  <div
                    role="status"
                    aria-label="Loading images"
                    className="min-h-[60vh] bg-surface"
                  />
                ) : layout.hero ? (
                  <Tile
                    key={`${work.id}-${layout.hero.src}`}
                    item={layout.hero}
                    total={total}
                    title={work.title}
                    eager
                  />
                ) : (
                  <div className="mx-5 grid min-h-64 place-items-center border border-dashed border-border text-sm text-muted md:mx-10">
                    Nothing to look at yet.
                  </div>
                )}
              </div>

              {/* Intro: facts and statement */}
              <section className="mt-10 grid gap-10 px-5 md:mt-20 md:grid-cols-12 md:gap-x-6 md:px-10">
                {meta.length > 0 && (
                  <dl className="space-y-5 md:col-span-4">
                    {meta.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted">{label}</dt>
                        <dd className="mt-1 font-serif text-lg leading-tight md:text-xl">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="line-clamp-7 whitespace-pre-line font-serif text-xl leading-relaxed md:col-span-7 md:col-start-6 md:text-2xl">
                  {work.desc ||
                    "No statement. The work will have to speak for itself."}
                </p>
              </section>

              {/* Masonry gallery, images shown at their original size */}
              {ready && layout.blocks.length > 0 && (
                <section
                  aria-label="Case study images"
                  className="mt-16 flex flex-col gap-2 md:mt-28 md:gap-3"
                >
                  {layout.blocks.map((block, bi) =>
                    block.type === "full" ? (
                      <Tile
                        key={`${work.id}-${block.item.src}`}
                        item={block.item}
                        total={total}
                        title={work.title}
                      />
                    ) : (
                      <div
                        key={`${work.id}-group-${bi}`}
                        className="flex items-start gap-2 md:gap-3"
                      >
                        {block.columns.map((column, ci) => (
                          <div
                            key={ci}
                            className="flex min-w-0 flex-1 flex-col gap-2 md:gap-3"
                          >
                            {column.map((item) => (
                              <Tile
                                key={`${work.id}-${item.src}`}
                                item={item}
                                total={total}
                                title={work.title}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ),
                  )}
                </section>
              )}

              {/* Other projects */}
              {others.length > 0 && (
                <footer className="mt-28 px-5 pb-16 md:mt-44 md:px-10 md:pb-20">
                  <div className="flex items-baseline justify-between gap-4 border-t border-border pt-5">
                    <h3 className="font-serif text-2xl md:text-3xl">
                      Still not convinced?
                    </h3>
                    <p className="text-xs tabular-nums text-muted">
                      {works.length} projects
                    </p>
                  </div>

                  <ul className="mt-8 grid grid-cols-3 gap-3 md:gap-6">
                    {others.map(({ delta, item }) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onStep(delta)}
                          className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                        >
                          <span className="block aspect-[4/5] overflow-hidden bg-surface">
                            <img
                              src={item.img}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              draggable={false}
                              className="h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            />
                          </span>

                          <span className="mt-3 flex items-baseline justify-between gap-3">
                            <span className="truncate font-serif text-base md:text-lg">
                              {item.title}
                            </span>

                            {item.year ? (
                              <span className="shrink-0 text-xs text-muted">
                                {item.year}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </footer>
              )}
            </MotionDiv>
          </div>

          {/* Full-screen project details */}
          <DetailsPanel
            work={work}
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            panelRef={detailsRef}
            closeRef={detailsCloseRef}
          />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

export default Viewer;
