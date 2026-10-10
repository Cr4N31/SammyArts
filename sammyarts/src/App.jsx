import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./shared/Header";
import Home from "./page/Home";
import Gallery from "./page/Gallery";
import Courses from "./page/Courses";
import Contact from "./page/Contact";
import Footer from "./shared/Footer";
import Admin from "./admin/Admin";
import { useEffect } from "react";
import Lenis from "lenis";
import { PageTransitionProvider } from "./shared/PageTransition";

function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

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

  return (
    <div className="page-flow min-h-screen text-text">
      <PageTransitionProvider>
        {!isAdmin && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/atelier" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
        {!isAdmin && <Footer />}
      </PageTransitionProvider>
    </div>
  );
}

export default App;
