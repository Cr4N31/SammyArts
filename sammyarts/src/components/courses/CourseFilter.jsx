function CourseFilter({ categories, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Filter courses">
      {categories.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={active === value}
          onClick={() => onChange(value)}
          className={`border-b pb-1 text-xs uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
            active === value
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:border-border hover:text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default CourseFilter;
