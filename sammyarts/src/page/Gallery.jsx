import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../data/content";
import GalleryIntro from "../components/gallery/GalleryIntro";
import WorkGrid from "../components/gallery/WorkGrid";
import Viewer from "../components/gallery/Viewer";
import { workCategories } from "../data/workCategories";

const OTHER = "Other";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildGroups(works) {
  const known = new Set(workCategories);

  const groups = workCategories.map((category) => ({
    category,
    works: works.filter((work) => work.category === category),
  }));

  const rest = works.filter((work) => !known.has(work.category));

  if (rest.length) {
    groups.push({ category: OTHER, works: rest });
  }

  let offset = 0;

  return groups
    .filter((group) => group.works.length > 0)
    .map((group) => {
      const withOffset = { ...group, offset };
      offset += group.works.length;
      return withOffset;
    });
}

function CategoryGroup({ group, number, onOpen }) {
  const id = slugify(group.category);
  const count = group.works.length;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <header className="mb-8 flex items-end justify-between gap-6 border-t border-border pt-5 md:mb-12">
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="font-serif text-sm tabular-nums text-muted">
            {String(number).padStart(2, "0")}
          </span>

          <h2
            id={`${id}-title`}
            className="font-serif text-[clamp(1.75rem,4vw,3rem)] leading-none tracking-[-0.03em]"
          >
            {group.category}
          </h2>
        </div>

        <p className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted">
          {String(count).padStart(2, "0")} {count === 1 ? "work" : "works"}
        </p>
      </header>

      <WorkGrid
        works={group.works}
        onOpen={(localIndex) => onOpen(group.offset + localIndex)}
      />
    </section>
  );
}

function Gallery() {
  const { works } = useContent();

  const groups = useMemo(() => buildGroups(works), [works]);

  // Flat list in display order so viewer navigation crosses categories.
  const ordered = useMemo(
    () => groups.flatMap((group) => group.works),
    [groups],
  );

  const [viewer, setViewer] = useState({
    open: false,
    index: 0,
  });

  // Track the URL project already opened to avoid reopening it
  // if the content array changes after loading.
  const openedProjectRef = useRef(null);

  const openViewer = useCallback(
    (index) => setViewer({ open: true, index }),
    [],
  );

  const closeViewer = useCallback(
    () => setViewer((current) => ({ ...current, open: false })),
    [],
  );

  const step = useCallback(
    (direction) =>
      setViewer((current) => ({
        ...current,
        index: ordered.length
          ? (current.index + direction + ordered.length) % ordered.length
          : 0,
      })),
    [ordered.length],
  );

  // Open a project requested through /gallery?project=PROJECT_ID.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");

    if (!projectId || !ordered.length) return;
    if (openedProjectRef.current === projectId) return;

    const index = ordered.findIndex((work) => String(work.id) === projectId);

    if (index === -1) return;

    openedProjectRef.current = projectId;
    openViewer(index);
  }, [ordered, openViewer]);

  return (
    <main className="page-reveal bg-brand text-cream">
      <GalleryIntro workCount={ordered.length} />

      <section aria-label="Works" className="px-5 pb-24 md:px-10 md:pb-32">
        {groups.length === 0 ? (
          <p className="border-t border-border py-8 text-sm text-muted">
            No works yet.
          </p>
        ) : (
          <div className="flex flex-col gap-20 md:gap-32">
            {groups.map((group, index) => (
              <CategoryGroup
                key={group.category}
                group={group}
                number={index + 1}
                onOpen={openViewer}
              />
            ))}
          </div>
        )}
      </section>

      <Viewer
        works={ordered}
        open={viewer.open}
        index={viewer.index}
        onClose={closeViewer}
        onStep={step}
      />
    </main>
  );
}

export default Gallery;
