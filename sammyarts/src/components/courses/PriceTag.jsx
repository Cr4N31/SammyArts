const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function PriceTag({ price, billing, size = "md" }) {
  const big = size === "lg";
  const amount = Number(price);
  const label = Number.isFinite(amount) && amount > 0
    ? formatter.format(amount)
    : "Free";
  return (
    <p className="flex items-baseline gap-2">
      <span
        className={`font-serif tracking-tight text-accent ${
          big ? "text-3xl md:text-4xl" : "text-xl"
        }`}
      >
        {label}
      </span>
      {billing === "per month" && (
        <span className="text-[0.65rem] uppercase tracking-[0.14em] opacity-60">
          / month
        </span>
      )}
    </p>
  );
}

export default PriceTag;
