const options = [
  { value: "all", label: "All" },
  { value: "course", label: "Courses" },
  { value: "mentorship", label: "Mentorship" },
];

function CourseFilter({ active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Filter by type"
      className="mb-10 mt-24 flex gap-6 font-serif text-2xl tracking-tight md:text-3xl"
    >
      {options.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={active === value}
          onClick={() => onChange(value)}
          className={`transition-opacity duration-300 ${
            active === value ? "opacity-100" : "opacity-25 hover:opacity-60"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default CourseFilter;
