import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./shared/Header";
import Home from "./page/Home";
import Gallery from "./page/Gallery";
import Footer from "./shared/Footer";
import Admin from "./admin/Admin";
import { useEffect } from "react";
import Lenis from "lenis";

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
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;
