import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useResolvedPath,
} from "react-router-dom";
import { useReducedMotion } from "motion/react";

const TransitionContext = createContext(null);

const PANELS = 4;

// Minimum time the screen stays fully covered, so the swap never flashes.
// Raise this if you want a deliberate pause on the covered screen.
const MIN_COVERED_MS = 200;

// Safety nets. Normal flow never reaches these, they only stop a transition
// from getting stuck if an animation event or a route never arrives.
const PHASE_SAFETY_MS = 2500;
const MAX_COVERED_MS = 5000;

const NEXT_PHASE = { closing: "covered", covered: "opening" };

const EXTERNAL_URL = /^[a-z][a-z\d+.-]*:/i;

function Curtain({ phase, onDone }) {
  const ended = useRef(0);

  // Count finished panels so the phase ends when the LAST panel finishes,
  // whatever stagger the CSS uses.
  useEffect(() => {
    ended.current = 0;
  }, [phase]);

  // Closing runs as a CSS animation and opening runs as a CSS transition, so
  // both event types are handled here.
  const handleEnd = (event) => {
    if (!onDone || event.target !== event.currentTarget) return;
    if (event.propertyName && event.propertyName !== "transform") return;

    ended.current += 1;

    if (ended.current >= PANELS) {
      ended.current = 0;
      onDone();
    }
  };

  return (
    <div aria-hidden="true" className={`page-curtain page-curtain--${phase}`}>
      {Array.from({ length: PANELS }, (_, panel) => (
        <div
          className="page-curtain__panel"
          key={panel}
          onAnimationEnd={handleEnd}
          onTransitionEnd={handleEnd}
        />
      ))}
    </div>
  );
}

export function PageLoader() {
  const transitions = useContext(TransitionContext);
  const registerLoader = transitions?.registerLoader;

  // Tell the provider a route is still loading, so the curtain stays closed
  // until the real page is ready instead of opening onto a spinner.
  useEffect(() => registerLoader?.(), [registerLoader]);

  // During a transition the provider's curtain is already covering the screen.
  // Rendering a second one would stack two curtains and cause a pop on reveal.
  if (transitions?.active) return null;

  return <Curtain phase="covered" />;
}

export function PageTransitionProvider({ children }) {
  const [transition, setTransition] = useState(null);
  const [holdDone, setHoldDone] = useState(false);
  const [loaders, setLoaders] = useState(0);

  const locked = useRef(false);
  const startKeyRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  // Latest router values live in refs, so effects do not restart (and reset
  // their timers) every time the router hands out a new navigate function.
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);

  useEffect(() => {
    navigateRef.current = navigate;
    locationRef.current = location;
  });

  const phase = transition?.phase ?? null;
  const to = transition?.to;
  const navOptions = transition?.options;

  // Move to the next phase. Guarded, so a late animation event and a safety
  // timer can both call it without skipping a phase.
  const advance = useCallback((from) => {
    setTransition((current) => {
      if (!current || current.phase !== from) return current;

      const next = NEXT_PHASE[from];

      return next ? { ...current, phase: next } : null;
    });
  }, []);

  const start = useCallback(
    (target, options) => {
      // With reduced motion, skip the curtain and let the router navigate.
      if (reduceMotion) return false;
      if (locked.current) return true;

      locked.current = true;
      setHoldDone(false);
      setTransition({ to: target, options, phase: "closing" });

      return true;
    },
    [reduceMotion],
  );

  const registerLoader = useCallback(() => {
    setLoaders((count) => count + 1);

    return () => setLoaders((count) => Math.max(0, count - 1));
  }, []);

  useEffect(() => {
    if (!transition) locked.current = false;
  }, [transition]);

  // Closing and opening: the CSS animation end drives the next phase.
  // This timer only exists as a fallback.
  useEffect(() => {
    if (phase !== "closing" && phase !== "opening") return undefined;

    const timer = window.setTimeout(() => advance(phase), PHASE_SAFETY_MS);

    return () => window.clearTimeout(timer);
  }, [phase, advance]);

  // Covered: the screen is fully hidden, so swap the route underneath.
  useEffect(() => {
    if (phase !== "covered") return undefined;

    startKeyRef.current = locationRef.current.key;
    navigateRef.current(to, navOptions);

    const hold = window.setTimeout(() => setHoldDone(true), MIN_COVERED_MS);
    const max = window.setTimeout(() => advance("covered"), MAX_COVERED_MS);

    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(max);
    };
  }, [phase, to, navOptions, advance]);

  // Open only when the new route has actually committed, any lazy route has
  // finished loading, and the minimum hold has passed. Two animation frames
  // let the browser paint the new page first, so the reveal starts on a free
  // main thread instead of stuttering through the route mount.
  useEffect(() => {
    if (phase !== "covered" || !holdDone || loaders > 0) return undefined;
    if (location.key === startKeyRef.current) return undefined;

    let frameA;
    let frameB;

    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        if (!locationRef.current.hash) {
          // "instant" beats any global scroll-behavior: smooth rule.
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }

        advance("covered");
      });
    });

    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
    };
  }, [phase, holdDone, loaders, location.key, advance]);

  const value = useMemo(
    () => ({ start, registerLoader, active: transition !== null }),
    [start, registerLoader, transition],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      {transition && (
        <Curtain
          phase={transition.phase}
          onDone={
            transition.phase === "covered"
              ? undefined
              : () => advance(transition.phase)
          }
        />
      )}
    </TransitionContext.Provider>
  );
}

export function PageTransitionLink({
  to,
  onClick,
  target,
  reloadDocument,
  replace,
  state,
  download,
  ...props
}) {
  const transitions = useContext(TransitionContext);
  const location = useLocation();
  const resolved = useResolvedPath(to);

  const handleClick = (event) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !transitions ||
      reloadDocument ||
      download ||
      (typeof to === "string" && EXTERNAL_URL.test(to)) ||
      (target && target !== "_self") ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      resolved.pathname === location.pathname ||
      location.pathname.startsWith("/admin") ||
      resolved.pathname.startsWith("/admin")
    ) {
      return;
    }

    if (transitions.start(to, { replace, state })) event.preventDefault();
  };

  return (
    <Link
      {...props}
      to={to}
      target={target}
      reloadDocument={reloadDocument}
      replace={replace}
      state={state}
      download={download}
      onClick={handleClick}
    />
  );
}
