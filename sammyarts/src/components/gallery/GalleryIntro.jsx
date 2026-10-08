function GalleryIntro({ workCount }) {
  return (
    <header className="mx-auto max-w-5xl px-5 pb-12 pt-36 md:px-10 md:pb-16 md:pt-48">
      <h1 className="font-serif text-[clamp(3.25rem,11vw,9rem)] italic leading-[0.92] tracking-[-0.05em]">
        The gallery
      </h1>
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/60">
        <span className="text-accent">{workCount}</span> works. Tap any piece to
        look closer.
      </p>
    </header>
  );
}

export default GalleryIntro;
