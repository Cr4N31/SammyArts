import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./shared/Header";
import Home from "./page/Home";
import Gallery from "./page/Gallery";
import Courses from "./page/Courses";
import Blog from "./page/Blog";
import BlogPost from "./page/BlogPost";
import Contact from "./page/Contact";
import Footer from "./shared/Footer";
import Admin from "./admin/Admin";
import { useEffect } from "react";
import Lenis from "lenis";
import { PageLoader, PageTransitionProvider } from "./shared/PageTransition";
import { useContent } from "./data/content";

function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const { ready } = useContent();

  useEffect(() => {
    if (isAdmin) return;
    const lenis = new Lenis({ lerp: 0.1 });
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, [isAdmin]);

  if (!ready) return <PageLoader />;

  return (
    <div className="page-flow min-h-screen text-text">
      <PageTransitionProvider>
        {!isAdmin && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/atelier" element={<Courses />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
        {!isAdmin && <Footer />}
      </PageTransitionProvider>
    </div>
  );
}

export default App;
