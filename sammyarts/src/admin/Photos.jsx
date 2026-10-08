import { useRef, useState } from "react";
import { useContent } from "../data/content";
import { uploadImage } from "./upload";

const heroLabels = [
  "Image 1",
  "Image 2",
  "Image 3",
  "Image 4",
  "Image 5",
  "Image 6",
  "Image 7",
  "Image 8",
  "Image 9",
];

const ghostClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-bg/80 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted backdrop-blur transition-colors duration-300 hover:border-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

function Slot({ label, src, busy, onUpload, onClear }) {
  const inputRef = useRef(null);
  const [failed, setFailed] = useState(false);

  return (
    <li className="border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <div className="mt-3 aspect-[4/5] border border-dashed border-border bg-raised">
        {src && !failed ? (
          <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted">
            No image
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onUpload(file);
          }}
        />
        <button
          type="button"
          className={ghostClass}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading" : "Upload"}
        </button>
        {src ? (
          <button type="button" className={ghostClass} disabled={busy} onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
    </li>
  );
}

function Photos() {
  const { site, saveSite } = useContent();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function change(key, next) {
    setBusy(key);
    setError("");
    try {
      await saveSite(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function uploadCeo(file) {
    setBusy("ceo");
    setError("");
    try {
      const url = await uploadImage(file);
      await saveSite({ ...site, ceo: url });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function uploadHero(label, file) {
    setBusy(label);
    setError("");
    try {
      const url = await uploadImage(file);
      await saveSite({ ...site, hero: { ...site.hero, [label]: url } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-muted">Photos</p>
      <h1 className="mt-4 font-serif text-5xl italic leading-[0.95] tracking-[-0.04em] md:text-6xl">
        Site pictures
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        These pictures appear on the home page. Project pictures are uploaded on Projects.
      </p>
      {error ? (
        <p className="mt-6 text-sm text-accent" role="alert">
          {error}
        </p>
      ) : null}
      <h2 className="mt-12 font-serif text-3xl italic">Founder</h2>
      <ul className="mt-6 grid max-w-xs">
        <Slot
          key={site.ceo || "ceo"}
          label="CEO"
          src={site.ceo}
          busy={Boolean(busy)}
          onUpload={uploadCeo}
          onClear={() => change("ceo", { ...site, ceo: "" })}
        />
      </ul>
      <h2 className="mt-12 font-serif text-3xl italic">Home collage</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {heroLabels.map((label) => (
          <Slot
            key={`${label}-${site.hero?.[label] || ""}`}
            label={label}
            src={site.hero?.[label] || ""}
            busy={Boolean(busy)}
            onUpload={(file) => uploadHero(label, file)}
            onClear={() =>
              change(label, { ...site, hero: { ...site.hero, [label]: "" } })
            }
          />
        ))}
      </ul>
    </div>
  );
}

export default Photos;
