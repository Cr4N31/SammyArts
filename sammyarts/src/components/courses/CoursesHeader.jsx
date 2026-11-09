function CoursesHeader({ search, onSearchChange }) {
  return (
    <header className="mx-auto max-w-6xl border-b border-border pb-12 md:pb-16">
      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted">
        The learning collection — 2026
      </p>
      <h1 className="max-w-4xl font-serif text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] tracking-[-0.06em]">
        Explore our <span className="text-accent">courses.</span>
      </h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] md:items-end">
        <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Curated knowledge. Practical skills. Meaningful progress. Build your
          creative practice through focused lessons and personal mentorship.
        </p>
      </div>
    </header>
  );
}

export default CoursesHeader;
