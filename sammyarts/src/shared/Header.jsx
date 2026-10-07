import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1];
const MotionHeader = motion.header;
const MotionDiv = motion.div;
const MotionSpan = motion.span;

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
const numerals = ["I", "II", "III", "IV", "V"];

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="group relative py-2 text-[0.7rem] uppercase tracking-[0.3em] text-accent/75 transition-colors duration-500 hover:text-accent"
  >
    {children}
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
    />
  </a>
);

const Wordmark = ({ visible, onClick }) => (
  <a
    href="/"
    onClick={onClick}
    aria-hidden={!visible}
    tabIndex={visible ? 0 : -1}
    className={`font-serif text-2xl italic leading-none tracking-tight text-accent transition-all duration-700 md:text-[1.75rem] ${
      visible
        ? "translate-y-0 opacity-100"
        : "pointer-events-none -translate-y-2 opacity-0"
    }`}
  >
    Sammy<span className="text-accent">Arts</span>
  </a>
);

function Header() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  // Hides on the way down, returns on the way up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 40);
    if (latest < 120) setHidden(false);
    else if (latest > prev) setHidden(true);
    else if (latest < prev) setHidden(false);
  });

  // Escape closes the menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock page scroll while the menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close the menu if the window grows to desktop size
  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const close = () => setOpen(false);
  const t = (duration, delay = 0) => ({
    duration: reduce ? 0 : duration,
    delay: reduce ? 0 : delay,
    ease: EASE,
  });

  const solid = scrolled && !open;

  return (
    <>
      <MotionHeader
        initial={false}
        animate={{ y: hidden && !open ? "-120%" : "0%" }}
        transition={t(0.6)}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid ? "bg-brand/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        {/* Desktop: centered masthead */}
        <nav
          aria-label="Primary"
          className="hidden grid-cols-[1fr_auto_1fr] items-center px-10 py-5 md:grid lg:px-16"
        >
          <ul className="flex items-center gap-8 justify-self-start lg:gap-12">
            {leftNavlinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.item}</NavLink>
              </li>
            ))}
          </ul>

          <Wordmark visible={scrolled} />

          <ul className="flex items-center gap-8 justify-self-end lg:gap-12">
            {rightNavlinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.item}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile: wordmark and menu toggle */}
        <div className="flex items-center justify-between px-5 py-2 md:hidden">
          <Wordmark visible={scrolled || open} onClick={close} />

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex items-center gap-3 py-3 pl-4 text-[0.7rem] uppercase tracking-[0.3em] text-cream"
          >
            {open ? "Close" : "Menu"}
            <span className="relative block h-2 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 h-px w-full bg-accent transition-all duration-500 ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-full bg-accent transition-all duration-500 ${
                  open
                    ? "top-1/2 -translate-y-1/2 -rotate-45"
                    : "top-full -translate-y-full"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Double rule, like the masthead of an old journal */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-accent/40 transition-opacity duration-500 ${
            solid ? "opacity-100" : "opacity-0"
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 -bottom-1 h-px bg-accent/15 transition-opacity duration-500 ${
            solid ? "opacity-100" : "opacity-0"
          }`}
        />
      </MotionHeader>

      {/* Mobile: full screen menu. Sits outside the header so the header's
          transform cannot trap it. */}
      <AnimatePresence>
        {open && (
          <MotionDiv
            key="menu"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={t(0.8)}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-brand px-5 pb-8 pt-24 md:hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_100%,rgba(247,142,72,0.14),transparent)]"
            />

            <nav
              aria-label="Mobile"
              className="relative flex flex-1 flex-col justify-center"
            >
              <ul>
                {allNavlinks.map((link, i) => (
                  <li
                    key={link.href}
                    className={`border-t border-cream/10 ${
                      i === allNavlinks.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <a
                      href={link.href}
                      onClick={close}
                      className="group flex items-baseline gap-5 py-3"
                    >
                      <span className="w-8 shrink-0 text-[0.65rem] tracking-[0.3em] text-accent">
                        {numerals[i]}
                      </span>
                      <span className="block overflow-hidden pb-1">
                        <MotionSpan
                          initial={{ y: "110%" }}
                          animate={{ y: "0%" }}
                          transition={t(0.9, 0.25 + i * 0.07)}
                          className="block font-serif text-[2.4rem] italic leading-[1.15] tracking-[-0.03em] text-accent/70 transition-colors duration-500 group-hover:text-accent group-active:text-accent"
                        >
                          {link.item}
                        </MotionSpan>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={t(0.8, 0.7)}
              className="relative flex items-end justify-between pt-6 text-[0.65rem] uppercase tracking-[0.3em] text-accent/50"
            >
              <span>Atelier and Gallery</span>
              <a
                href="/courses"
                onClick={close}
                className="transition-colors duration-500 hover:text-accent"
              >
                Courses and Mentorship
              </a>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
