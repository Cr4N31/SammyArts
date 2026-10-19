import { useCallback, useMemo, useState } from "react";
import { useContent } from "../data/content";
import GalleryIntro from "../components/gallery/GalleryIntro";
import WorkGrid from "../components/gallery/WorkGrid";
import Viewer from "../components/gallery/Viewer";
import { workCategories } from "../data/workCategories";

function GalleryFilters({ activeCategory, onChange }) {
  const filters = ["All", ...workCategories];

  return (
    <div
      role="group"
      aria-label="Filter works by category"
      className="mx-auto mb-12 grid max-w-5xl grid-cols-2 gap-1 rounded-md border border-border bg-surface p-1 md:grid-cols-3"
    >
      {filters.map((category) => {
        const active = category === activeCategory;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category)}
            className={`min-h-11 rounded-sm px-3 py-3 text-center text-xs uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm ${
              active
                ? "bg-accent text-brand"
                : "text-muted hover:bg-raised hover:text-text"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

function Gallery() {
  const { works } = useContent();
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredWorks = useMemo(
    () =>
      activeCategory === "All"
        ? works
        : works.filter((work) => work.category === activeCategory),
    [activeCategory, works],
  );

  // `open` is separate from `index` so the viewer can fade out on close
  const [viewer, setViewer] = useState({ open: false, index: 0 });

  const openViewer = useCallback(
    (index) => setViewer({ open: true, index }),
    [],
  );
  const closeViewer = useCallback(
    () => setViewer((v) => ({ ...v, open: false })),
    [],
  );
  const step = useCallback(
    (dir) =>
      setViewer((v) => ({
        ...v,
        index: filteredWorks.length
          ? (v.index + dir + filteredWorks.length) % filteredWorks.length
          : 0,
      })),
    [filteredWorks.length],
  );

  return (
    <main className="page-reveal bg-brand text-cream">
      <GalleryIntro workCount={filteredWorks.length} />

      <section aria-label="Works" className="px-5 pb-24 md:px-10 md:pb-32">
        <GalleryFilters
          activeCategory={activeCategory}
          onChange={(category) => {
            setActiveCategory(category);
            setViewer((current) => ({ ...current, open: false, index: 0 }));
          }}
        />
        <WorkGrid works={filteredWorks} onOpen={openViewer} />
      </section>

      <Viewer
        works={filteredWorks}
        open={viewer.open}
        index={viewer.index}
        onClose={closeViewer}
        onStep={step}
      />
    </main>
  );
}

export default Gallery;
