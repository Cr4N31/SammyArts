import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import logo from "/img/Light.png";

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const MotionUl = motion.ul;
const MotionLi = motion.li;

const navlinks = [
  { item: "Home", href: "/" },
  { item: "Gallery", href: "/gallery" },
  { item: "Atelier", href: "/atelier" },
  { item: "Blog", href: "/blog" },
  { item: "Contact", href: "/contact" },
];

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

function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed left-0 top-0 z-50 w-full text-text">
      <nav
        aria-label="Primary"
        className="flex items-center justify-between px-5 py-3 md:px-10 md:py-6"
      >
        {/* Logo */}
        <a href="/" onClick={() => setOpen(false)} aria-label="SammyArts home">
          <img src={logo} alt="SammyArts" className="w-32 h-full" />
        </a>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 grid h-11 w-11 place-items-center text-muted transition-colors duration-300 hover:text-accent-hover focus-visible:text-accent-hover"
        >
          <span className="relative block h-2 w-6" aria-hidden="true">
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
      </nav>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <MotionDiv
            key="backdrop"
            className="fixed inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <MotionUl
            key="menu"
            id="site-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute right-4 top-full w-[calc(100%-2rem)] max-w-xs origin-top-right overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl backdrop-blur-md md:right-16 md:max-w-sm"
          >
            {navlinks.map((link, i) => {
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
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-serif text-2xl italic transition-colors duration-300 hover:bg-raised hover:text-accent-hover ${
                      active ? "bg-raised text-accent" : "text-muted"
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
                    <span className="font-sans text-[0.65rem] not-italic tracking-[0.2em] text-muted/70">
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
