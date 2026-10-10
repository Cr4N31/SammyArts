import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
const logo = "/img/Light.png";

function Curtain({ phase }) {
  return (
    <div aria-hidden="true" className={`page-curtain page-curtain--${phase}`}>
      {[0, 1, 2, 3].map((panel) => (
        <div className="page-curtain__panel" key={panel} />
      ))}
      {(phase === "logo" || phase === "opening") && (
        <div className="page-curtain__logo">
          <img src={logo} alt="" className="page-curtain__logo-dim" />
          <img src={logo} alt="" className="page-curtain__logo-fill" />
        </div>
      )}
    </div>
  );
}

export function PageTransitionProvider({ children }) {
  const [transition, setTransition] = useState(null);
  const locked = useRef(false);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const startTransition = useCallback((to) => {
    if (locked.current) return true;
    locked.current = true;
    setTransition({ to, phase: "closing" });
    return true;
  }, []);

  useEffect(() => {
    if (!transition) return undefined;

    const closeDuration = reduceMotion ? 1 : 800;
    const logoDuration = reduceMotion ? 1 : 830;
    const openDuration = reduceMotion ? 1 : 800;
    let timer;

    if (transition.phase === "closing") {
      timer = window.setTimeout(() => {
        // Screen is fully covered now, so swap the page underneath
        navigate(transition.to);
        window.scrollTo(0, 0);
        setTransition((current) => ({ ...current, phase: "logo" }));
      }, closeDuration);
    } else if (transition.phase === "logo") {
      timer = window.setTimeout(
        () => setTransition((current) => ({ ...current, phase: "opening" })),
        logoDuration,
      );
    } else {
      timer = window.setTimeout(() => {
        setTransition(null);
        locked.current = false;
      }, openDuration);
    }

    return () => window.clearTimeout(timer);
  }, [navigate, reduceMotion, transition]);

  return (
    <TransitionContext.Provider value={startTransition}>
      {children}
      {transition && <Curtain phase={transition.phase} />}
    </TransitionContext.Provider>
  );
}

export function PageTransitionLink({
  to,
  onClick,
  target,
  reloadDocument,
  ...props
}) {
  const startTransition = useContext(TransitionContext);
  const location = useLocation();
  const resolved = useResolvedPath(to);

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      !startTransition ||
      reloadDocument ||
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

    if (startTransition(to)) event.preventDefault();
  };

  return (
    <Link
      {...props}
      to={to}
      target={target}
      reloadDocument={reloadDocument}
      onClick={handleClick}
    />
  );
}
