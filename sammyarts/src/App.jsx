import Header from "./shared/Header";
import Home from "./page/Home";
import Footer from "./shared/Footer";
// in App.jsx
import { useEffect } from "react";
import Lenis from "lenis";

function App() {
  useEffect(() => {
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
  }, []);
  return (
    <div className="page-flow min-h-screen text-text">
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
