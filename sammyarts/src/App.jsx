import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./shared/Header";
import Home from "./page/Home";
import Gallery from "./page/Gallery";
import Courses from "./page/Courses";
import Blog from "./page/Blog";
import BlogPost from "./page/BlogPost";
import Contact from "./page/Contact";
import Checkout from "./page/Checkout";
import CheckoutResult from "./page/CheckoutResult";
import Footer from "./shared/Footer";
import Admin from "./admin/Admin";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { PageLoader, PageTransitionProvider } from "./shared/PageTransition";
import { useContent } from "./data/content";

function App() {
  const location = useLocation();
  const { pathname, hash } = location;
  const isAdmin = pathname.startsWith("/admin");
  const { ready } = useContent();
  const [loaderDismissed, setLoaderDismissed] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!ready) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => setLoaderDismissed(true),
      reducedMotion ? 0 : 550,
    );

    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (isAdmin) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdmin]);

  useLayoutEffect(() => {
    if (hash) return;

    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  useLayoutEffect(() => {
    if (
      isAdmin ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const targets = document.querySelectorAll(
      "[data-scroll-fade], main > *, footer > *",
    );

    if (!targets.length) return undefined;

    targets.forEach((target) => target.classList.add("scroll-fade"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "scroll-fade--visible",
            entry.isIntersecting,
          );
        });
      },
      { threshold: 0.05 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      targets.forEach((target) => {
        target.classList.remove("scroll-fade", "scroll-fade--visible");
      });
    };
  }, [isAdmin, pathname, ready]);

  return (
    <>
      {ready && (
        <div className="page-flow min-h-screen text-text">
          <PageTransitionProvider>
            {!isAdmin && <Header />}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/atelier" element={<Courses />} />
              <Route path="/checkout/success" element={<CheckoutResult />} />
              <Route path="/success" element={<CheckoutResult />} />
              <Route path="/checkout/:slug" element={<Checkout />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/*" element={<Admin />} />
            </Routes>
            {!isAdmin && <Footer />}
          </PageTransitionProvider>
        </div>
      )}
      {!loaderDismissed && <PageLoader exiting={ready} />}
    </>
  );
}

export default App;
