import { useState } from "react";

// Image with a quiet fallback, so a broken link never shows a broken icon.
// Size it with an aspect class through `className`.
function PostImage({ src, alt, className = "", priority = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid w-full place-items-center bg-surface px-3 text-center text-xs text-muted ${className}`}
      >
        {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={`block w-full select-none object-cover ${className}`}
    />
  );
}

export default PostImage;
