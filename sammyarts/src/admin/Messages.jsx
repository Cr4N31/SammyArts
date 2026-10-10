import { useCallback, useEffect, useState } from "react";
import {
  deleteContactMessage,
  listContactMessages,
} from "../data/contact";

const ghostClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-bg/80 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors duration-300 hover:border-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

const pillClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

function formatWhen(date) {
  if (!date) return "Just now";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Messages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listContactMessages());
    } catch (err) {
      setError(err.message || "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await listContactMessages();
        if (!cancelled) setItems(next);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load messages.");
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
      await deleteContactMessage(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err.message || "Could not delete that message.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Contact
          </p>
          <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
            The <span className="text-accent">messages</span>
          </h1>
        </div>
        <button
          type="button"
          className={ghostClass}
          disabled={loading}
          onClick={load}
        >
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      <p className="mt-6 text-sm text-muted">
        <span className="font-serif text-4xl italic text-accent">
          {String(items.length).padStart(2, "0")}
        </span>
        <span className="mt-1 block">
          {loading ? "Loading" : "Messages from the contact page"}
        </span>
      </p>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-accent">
          {error}
        </p>
      ) : null}

      <ul className="mt-10">
        {!loading && items.length === 0 ? (
          <li className="border-t border-border py-8 text-sm text-muted">
            No messages yet.
          </li>
        ) : null}
        {items.map((item) => (
          <li
            key={item.id}
            className="border-t border-border py-6 last:border-b"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-muted">
                  {formatWhen(item.createdAt)}
                </p>
                <h2 className="mt-2 font-serif text-3xl italic tracking-[-0.03em] break-words">
                  {item.name}
                </h2>
                <a
                  href={`mailto:${item.email}`}
                  className="mt-1 inline-block text-sm text-accent break-all hover:text-accent-hover"
                >
                  {item.email}
                </a>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted whitespace-pre-wrap break-words">
                  {item.message}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {confirmId === item.id ? (
                  <>
                    <button
                      type="button"
                      className={pillClass}
                      disabled={busyId === item.id}
                      onClick={() => remove(item.id)}
                    >
                      Delete it
                    </button>
                    <button
                      type="button"
                      className={ghostClass}
                      disabled={busyId === item.id}
                      onClick={() => setConfirmId(null)}
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={ghostClass}
                    disabled={Boolean(busyId)}
                    onClick={() => setConfirmId(item.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Messages;
