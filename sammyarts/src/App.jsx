import Header from "./shared/Header";
import Home from "./page/Home";
// in App.jsx
import { useEffect, useRef } from "react";
import Lenis from "lenis";

function App() {
  const aboutRef = useRef(null);

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
    <main className="min-h-screen bg-accent">
      <Header aboutRef={aboutRef} />
      <Home aboutRef={aboutRef} />
    </main>
  );
}

export default App;
