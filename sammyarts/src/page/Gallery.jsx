<<<<<<< HEAD
import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { galleryWorks } from "../data/galleryData";
import GalleryIntro from "../components/gallery/GalleryIntro";
import WorkGrid from "../components/gallery/WorkGrid";
import Viewer from "../components/gallery/Viewer";

const MotionMain = motion.main;

function Gallery() {
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
      index: (v.index + dir + galleryWorks.length) % galleryWorks.length,
      })),
    [],
  );

  return (
    <MotionMain
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-brand text-cream"
    >
      <GalleryIntro workCount={galleryWorks.length} />

      <section aria-label="Works" className="px-5 pb-24 md:px-10 md:pb-32">
        <WorkGrid works={galleryWorks} onOpen={openViewer} />
      </section>

      <Viewer
        works={galleryWorks}
        open={viewer.open}
        index={viewer.index}
        onClose={closeViewer}
        onStep={step}
      />
    </MotionMain>
=======
import { useState } from "react";
import { useContent } from "../data/content";

function Shot({ work }) {
  const [failed, setFailed] = useState(false);
  const showImage = work.img && !failed;

  return (
    <li className="bg-raised">
      <div className="aspect-[4/3] overflow-hidden bg-surface">
        {showImage ? (
          <img
            src={work.img}
            alt={work.title}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center border border-dashed border-border text-xs text-muted">
            {work.title}
          </div>
        )}
      </div>
      <div className="px-4 py-5">
        <h2 className="font-serif text-2xl italic tracking-[-0.03em]">
          {work.title}
        </h2>
        {work.desc ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{work.desc}</p>
        ) : null}
      </div>
    </li>
  );
}

function Gallery() {
  const { works } = useContent();

  return (
    <main className="px-5 pb-24 pt-28 text-text md:px-10 md:pt-36">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
          Gallery
        </p>
        <h1 className="max-w-3xl font-serif text-[clamp(2.75rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.05em]">
          The full collection
        </h1>
        {works.length === 0 ? (
          <p className="mt-12 text-sm text-muted">No pieces yet.</p>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <Shot key={work.id} work={work} />
            ))}
          </ul>
        )}
      </div>
    </main>
>>>>>>> 7fe4b3d (Add an admin panel for uploading projects and site photos)
  );
}

export default Gallery;
