import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useContent } from "../data/content";
import GalleryIntro from "../components/gallery/GalleryIntro";
import WorkGrid from "../components/gallery/WorkGrid";
import Viewer from "../components/gallery/Viewer";

const MotionMain = motion.main;

function Gallery() {
  const { works } = useContent();
  const reduceMotion = useReducedMotion();

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
    <MotionMain
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-brand text-cream"
    >
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
    </MotionMain>
  );
}

export default Gallery;
