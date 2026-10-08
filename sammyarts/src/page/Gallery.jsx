import { useCallback, useState } from "react";
import { galleryWorks } from "../data/galleryData";
import GalleryIntro from "../components/gallery/GalleryIntro";
import WorkGrid from "../components/gallery/WorkGrid";
import Viewer from "../components/gallery/Viewer";

// Works shown before "View all work" is pressed.
// Set this to galleryWorks.length to show everything and hide the button.
const INITIAL_COUNT = 6;

function Gallery() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? galleryWorks : galleryWorks.slice(0, INITIAL_COUNT);

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
        index: (v.index + dir + visible.length) % visible.length,
      })),
    [visible.length],
  );

  return (
    <main className="bg-brand text-cream">
      <GalleryIntro workCount={galleryWorks.length} />

      <section aria-label="Works" className="px-5 pb-24 md:px-10 md:pb-32">
        <WorkGrid works={visible} onOpen={openViewer} />
      </section>

      <Viewer
        works={visible}
        open={viewer.open}
        index={viewer.index}
        onClose={closeViewer}
        onStep={step}
      />
    </main>
  );
}

export default Gallery;
