const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Small initials badge, author name, and date
function AuthorLine({ author, date, className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 text-xs text-cream/60 ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/40 text-[0.65rem] text-accent"
      >
        {initials(author)}
      </span>
      <span>
        {author} <span aria-hidden="true">&bull;</span>{" "}
        <time dateTime={date}>{formatDate(date)}</time>
      </span>
    </div>
  );
}

export default AuthorLine;
