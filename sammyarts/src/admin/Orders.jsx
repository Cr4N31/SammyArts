import { useCallback, useEffect, useState } from "react";
import { deleteOrder, listOrders } from "../data/orders";

const ghostClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-bg/80 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors duration-300 hover:border-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

const pillClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatWhen(date) {
  if (!date) return "Just now";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAmount(amount, currency) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount || "—";
  if (String(currency || "NGN").toUpperCase() === "NGN") {
    return money.format(value);
  }
  return `${value.toLocaleString()} ${currency || ""}`.trim();
}

function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listOrders());
    } catch (err) {
      setError(err.message || "Could not load purchases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await listOrders();
        if (!cancelled) setItems(next);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load purchases.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id) {
    setBusyId(id);
    setError("");
    try {
      await deleteOrder(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err.message || "Could not delete that purchase.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Sales
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
            Course <span className="text-accent">buyers</span>
          </h1>
        </div>
        <button type="button" className={ghostClass} onClick={load} disabled={loading}>
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      <p className="mt-6 text-sm text-muted">
        <span className="font-serif text-4xl italic text-accent">
          {String(items.length).padStart(2, "0")}
        </span>
        <span className="mt-1 block">
          {loading ? "Loading" : "People who bought a course or mentorship"}
        </span>
      </p>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {error}
        </p>
      ) : null}

      <ul className="mt-10">
        {loading ? (
          <li className="border-t border-border py-8 text-sm text-muted">
            Loading purchases…
          </li>
        ) : items.length === 0 ? (
          <li className="border-t border-border py-8 text-sm text-muted">
            No purchases yet.
          </li>
        ) : (
          items.map((order) => (
            <li
              key={order.id}
              className="grid gap-4 border-t border-border py-6 last:border-b md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-muted">
                  {order.courseType === "mentorship" ? "Mentorship" : "Course"}
                  {order.courseTitle ? ` · ${order.courseTitle}` : ""}
                  {order.amount
                    ? ` · ${formatAmount(order.amount, order.currency)}`
                    : ""}
                </p>
                <h2 className="mt-1 font-serif text-3xl italic tracking-[-0.03em] break-words">
                  {order.name || "Buyer"}
                </h2>
                <p className="mt-2 text-sm text-muted break-all">{order.email}</p>
                <p className="mt-2 text-xs text-muted">
                  {formatWhen(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end md:self-start">
                {confirmId === order.id ? (
                  <>
                    <button
                      type="button"
                      className={pillClass}
                      disabled={busyId === order.id}
                      onClick={() => remove(order.id)}
                    >
                      Delete it
                    </button>
                    <button
                      type="button"
                      className={ghostClass}
                      disabled={busyId === order.id}
                      onClick={() => setConfirmId(null)}
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={ghostClass}
                    disabled={busyId === order.id}
                    onClick={() => setConfirmId(order.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Orders;
