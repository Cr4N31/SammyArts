import { useCallback, useState } from "react";
import { useContent } from "../data/content";
import GalleryIntro from "../components/gallery/GalleryIntro";
import WorkGrid from "../components/gallery/WorkGrid";
import Viewer from "../components/gallery/Viewer";

function Gallery() {
  const { works } = useContent();

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
        index: works.length ? (v.index + dir + works.length) % works.length : 0,
      })),
    [works.length],
  );

  return (
    <main className="page-reveal bg-brand text-cream">
      <GalleryIntro workCount={works.length} />

      <section aria-label="Works" className="px-5 pb-24 md:px-10 md:pb-32">
        <WorkGrid works={works} onOpen={openViewer} />
      </section>

      <Viewer
        works={works}
        open={viewer.open}
        index={viewer.index}
        onClose={closeViewer}
        onStep={step}
      />
    </main>
  );
}

export default Gallery;
