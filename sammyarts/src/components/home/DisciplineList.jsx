import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  "Brand Strategy & Identity",
  "Creative Direction",
  "Campaign Strategy",
  "Brand Launch Systems",
  "Packaging & Print Design",
  "Editorial & Cover Design",
  "Entertainment Branding",
];

const ITEM_HEIGHT = 44; // px, height of one row
const VISIBLE_EACH_SIDE = 3; // rows shown above and below the active one
const WHEEL_STEP = 50; // wheel delta needed to move one row
const EASE = 0.16; // 0 to 1, higher settles faster

const DRAG_THRESHOLD = 4; // px of movement before a press becomes a drag
const FLING_MS = 180; // how far ahead release velocity is projected (inertia)
const AUTO_INTERVAL = 2400; // ms between automatic steps
const AUTO_RESUME_DELAY = 3000; // ms of quiet after interaction before autoplay resumes

// Opacity by distance from the active row: 0, 1, 2, 3 rows away, then gone.
// Only the active row is bright; everything else is dulled out.
const FADE = [1, 0.25, 0.12, 0.05, 0];

const mod = (n, m) => ((n % m) + m) % m;

function fadeFor(distance) {
  const a = Math.abs(distance);
  const lo = Math.floor(a);
  const hi = lo + 1;

  if (lo >= FADE.length - 1) return 0;

  return FADE[lo] + (FADE[hi] - FADE[lo]) * (a - lo);
}

/**
 * Infinite list you can drag, flick, scroll, or leave alone. The active row
 * sits in the middle with an accent chevron, and every other row is dulled
 * out the further it is from it. Scrolling or dragging past either end wraps
 * around. When nobody is touching it, it advances by itself.
 *
 * Props:
 *   items             string[]                 labels to show
 *   onChange          (index, label) => void   called when the active row changes
 *   autoPlay          boolean                  advance by itself (default true)
 *   autoPlayInterval  number                   ms between automatic steps
 *   className         string                   extra classes for the wrapper
 */
export default function DisciplineList({
  items = DEFAULT_ITEMS,
  onChange,
  autoPlay = true,
  autoPlayInterval = AUTO_INTERVAL,
  className = "",
}) {
  const count = items.length;
  const rows = ITEM_HEIGHT * (VISIBLE_EACH_SIDE * 2 + 1);

  const rootRef = useRef(null);
  const frameRef = useRef(0);
  const targetRef = useRef(0);
  const posRef = useRef(0);
  const wheelAcc = useRef(0);
  const lastActive = useRef(0);
  const dragRef = useRef(null);
  const lastInteraction = useRef(0);

  const [pos, setPos] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const touch = () => {
    lastInteraction.current = performance.now();
  };

  // Eases the displayed position toward the target position.
  const run = useCallback(() => {
    cancelAnimationFrame(frameRef.current);

    const tick = () => {
      const diff = targetRef.current - posRef.current;

      if (reduceMotion.current || Math.abs(diff) < 0.001) {
        posRef.current = targetRef.current;
        setPos(posRef.current);
        return;
      }

      posRef.current += diff * EASE;
      setPos(posRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, []);

  const move = useCallback(
    (steps) => {
      if (count < 2) return;

      // Start from a whole row so clicks after a drag never land between rows.
      targetRef.current = Math.round(targetRef.current) + steps;
      run();
    },
    [count, run],
  );

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Autoplay: step forward on a timer, but stay out of the way while the
  // person is dragging, scrolling or has just let go.
  useEffect(() => {
    if (!autoPlay || count < 2) return;

    const id = setInterval(() => {
      if (reduceMotion.current || document.hidden) return;
      if (dragRef.current) return;
      if (performance.now() - lastInteraction.current < AUTO_RESUME_DELAY) {
        return;
      }

      move(1);
    }, autoPlayInterval);

    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval, count, move]);

  // Wheel needs a non-passive listener so the page does not scroll too.
  useEffect(() => {
    const node = rootRef.current;

    if (!node) return;

    const onWheel = (e) => {
      e.preventDefault();
      touch();

      wheelAcc.current += e.deltaY;

      const steps = Math.trunc(wheelAcc.current / WHEEL_STEP);

      if (steps !== 0) {
        wheelAcc.current -= steps * WHEEL_STEP;
        move(steps);
      }
    };

    node.addEventListener("wheel", onWheel, { passive: false });

    return () => node.removeEventListener("wheel", onWheel);
  }, [move]);

  const active = mod(Math.round(pos), count);

  useEffect(() => {
    if (active === lastActive.current) return;

    lastActive.current = active;
    onChange?.(active, items[active]);
  }, [active, items, onChange]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      touch();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      touch();
      move(-1);
    }
  };

  // Pointer events cover mouse, touch and pen with one code path.
  const onPointerDown = (e) => {
    if (count < 2) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    cancelAnimationFrame(frameRef.current);
    targetRef.current = posRef.current;
    touch();

    dragRef.current = {
      id: e.pointerId,
      startY: e.clientY,
      startPos: posRef.current,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0, // rows per ms
      active: false,
    };
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;

    if (!d || d.id !== e.pointerId) return;

    const dy = e.clientY - d.startY;

    if (!d.active) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;

      d.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setGrabbing(true);
    }

    touch();

    const now = performance.now();
    const dt = now - d.lastT;

    if (dt > 0) {
      const instant = -(e.clientY - d.lastY) / ITEM_HEIGHT / dt;

      d.velocity = d.velocity * 0.7 + instant * 0.3;
    }

    d.lastY = e.clientY;
    d.lastT = now;

    // Dragging down moves the list down, so the position goes backwards.
    const next = d.startPos - dy / ITEM_HEIGHT;

    posRef.current = next;
    targetRef.current = next;
    setPos(next);
  };

  const endDrag = (e) => {
    const d = dragRef.current;

    if (!d || d.id !== e.pointerId) return;

    dragRef.current = null;
    touch();

    if (d.active) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      setGrabbing(false);

      // A pause before release cancels the fling.
      const held = performance.now() - d.lastT > 80;
      const velocity = held ? 0 : d.velocity;

      targetRef.current = Math.round(posRef.current + velocity * FLING_MS);
    } else {
      targetRef.current = Math.round(posRef.current);
    }

    run();
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Disciplines"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative select-none overflow-hidden text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 ${className}`}
      style={{
        height: rows,
        touchAction: "none",
        overscrollBehavior: "contain",
        cursor: grabbing ? "grabbing" : "grab",
      }}
    >
      {/* Chevron marking the active row */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="absolute left-0 h-5 w-5 -translate-y-1/2 text-orange-400"
        style={{ top: rows / 2 }}
      >
        <path d="m9 5 7 7-7 7" />
      </svg>

      {items.map((label, i) => {
        // Shortest signed distance from the active position, so the list wraps.
        let d = mod(i - pos, count);

        if (d > count / 2) d -= count;

        const opacity = fadeFor(d);

        if (opacity <= 0) return null;

        const isActive = i === active;

        // A div, not an h1: the page already has its own headings, and a
        // heading element can't carry type="button".
        return (
          <div
            key={label}
            aria-current={isActive ? "true" : undefined}
            onClick={() => move(Math.round(d))}
            className={`absolute left-0 w-full pl-12 text-left text-xl leading-none tracking-wide ${
              isActive ? "font-medium" : "font-normal"
            }`}
            style={{
              height: ITEM_HEIGHT,
              top: rows / 2 - ITEM_HEIGHT / 2,
              transform: `translateY(${d * ITEM_HEIGHT}px)`,
              opacity,
              willChange: "transform, opacity",
              cursor: "inherit",
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
