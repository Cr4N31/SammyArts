import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

const leftNavlinks = [
  { item: "Home", href: "/" },
  { item: "Gallery", href: "/gallery" },
];
const rightNavlinks = [
  { item: "Atleier", href: "/atelier" },
  { item: "Blog", href: "/blog" },
  { item: "Contact", href: "/contact" },
];
const allNavlinks = [...leftNavlinks, ...rightNavlinks];
const MotionDiv = motion.div;
const MotionUl = motion.ul;
const MotionLi = motion.li;

function Header({ aboutRef }) {
  const [isOnLightBackground, setIsOnLightBackground] = useState(false);
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setIsOnLightBackground(progress >= 0.75);
  });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkStyle = isOnLightBackground
    ? "border-brand text-brand hover:bg-brand hover:border-brand hover:text-accent"
    : "border-accent text-accent hover:bg-accent hover:border-accent hover:text-brand";
  const linkClassName = `block border ${linkStyle} transition-all duration-300 rounded-full px-6 py-1 text-xs`;

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-transparent">
      <nav className="flex items-center justify-between">
        {/* Desktop: row layout */}
        <ul className="hidden items-center gap-4 p-4 md:flex">
          {leftNavlinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClassName}>
                {link.item}
              </a>
            </li>
          ))}
        </ul>
        <ul className="hidden items-center gap-4 p-4 md:flex">
          {rightNavlinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClassName}>
                {link.item}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile: menu button */}
        <div className="ml-auto p-4 md:hidden">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`flex items-center gap-3 rounded-full border px-5 py-1.5 text-xs transition-all duration-300 ${linkStyle}`}
          >
            Menu
            <span className="relative block h-2 w-4" aria-hidden="true">
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
            {allNavlinks.map((link, i) => (
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
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 font-serif text-2xl italic text-accent transition-all duration-250 hover:bg-accent hover:text-brand"
                >
                  {link.item}
                  <span className="font-sans text-[0.65rem] not-italic tracking-[0.2em] opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </a>
              </MotionLi>
            ))}
          </MotionUl>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
