function BuyButton({ onClick, label = "Buy now" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="button-slide group inline-flex items-center gap-2 rounded-full border border-accent bg-brand px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white"
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
