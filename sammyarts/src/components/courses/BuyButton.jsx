function BuyButton({ onClick, label = "Buy now", variant = "solid" }) {
  const styles =
    variant === "solid"
      ? "bg-accent text-brand hover:bg-white"
      : "border-b border-current pb-1 hover:text-accent";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${styles} ${
        variant === "solid" ? "px-5 py-3" : ""
      }`}
    >
      {label}
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}

export default BuyButton;
