import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1];
const MotionSpan = motion.span;
const MotionDiv = motion.div;
const MotionUl = motion.ul;
const MotionLi = motion.li;

const leftNavlinks = [
  { item: "Home", href: "/" },
  { item: "Gallery", href: "/gallery" },
];
const rightNavlinks = [
  { item: "Atelier", href: "/atelier" },
  { item: "Blog", href: "/blog" },
  { item: "Contact", href: "/contact" },
];
const allNavlinks = [...leftNavlinks, ...rightNavlinks];

// Reads the current path. If you use react-router, delete this hook and use:
// const { pathname } = useLocation();
function usePathname() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return path;
}

const isActive = (path, href) =>
  href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

// Desktop link: underline draws in on hover, stays drawn on the current page
const NavLink = ({ href, active, children }) => (
  <a
    href={href}
    aria-current={active ? "page" : undefined}
    className="group relative block py-2 text-[0.7rem] uppercase tracking-[0.25em]"
  >
    {children}
    {active ? (
      <MotionSpan
        layoutId="nav-active"
        aria-hidden="true"
        transition={{ duration: 0.6, ease: EASE }}
        className="absolute inset-x-0 bottom-0 h-px bg-current"
      />
    ) : (
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    )}
  </a>
);

function Header({ aboutRef }) {
  const [hasLeftHero, setHasLeftHero] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setHasLeftHero(progress > 0);
  });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const textColor = hasLeftHero ? "text-brand" : "text-accent";

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full bg-transparent transition-colors duration-300 ${textColor}`}
    >
      <nav
        aria-label="Primary"
        className="flex items-center justify-between px-5 py-3 md:px-16 md:py-6"
      >
        {/* Desktop: row layout */}
        <ul className="hidden items-center gap-10 md:flex">
          {leftNavlinks.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} active={isActive(path, link.href)}>
                {link.item}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="hidden items-center gap-10 md:flex">
          {rightNavlinks.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} active={isActive(path, link.href)}>
                {link.item}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile: menu button */}
        <div className="ml-auto md:hidden">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex items-center gap-3 py-2 text-[0.7rem] uppercase tracking-[0.25em]"
          >
            {open ? "Close" : "Menu"}
            <span className="relative block h-2 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 h-px w-full bg-current transition-all duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-full bg-current transition-all duration-300 ${
                  open
                    ? "top-1/2 -translate-y-1/2 -rotate-45"
                    : "top-full -translate-y-full"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile: dropdown */}
      <AnimatePresence>
        {open && (
          <MotionDiv
            key="backdrop"
            className="fixed inset-0 -z-10 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <MotionUl
            key="menu"
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-x-4 top-full origin-top overflow-hidden rounded-2xl border border-accent/30 bg-brand/95 p-2 backdrop-blur-md md:hidden"
          >
            {allNavlinks.map((link, i) => {
              const active = isActive(path, link.href);
              return (
                <MotionLi
                  key={link.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.08 + i * 0.05,
                    ease: EASE,
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between px-4 py-3.5 font-serif text-2xl italic text-accent transition-all duration-250 hover:bg-accent hover:text-brand ${
                      active ? "bg-accent/10" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full bg-current ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {link.item}
                    </span>
                    <span className="font-sans text-[0.65rem] not-italic tracking-[0.2em] opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </MotionLi>
              );
            })}
          </MotionUl>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
