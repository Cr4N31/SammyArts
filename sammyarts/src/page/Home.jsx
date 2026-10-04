import Hero from "../components/home/Hero";
import About from "../components/home/About";
import Portfolio from "../components/home/Portfolio";

function Home({ aboutRef }) {
  return (
    <main>
      <Hero />
      <About sectionRef={aboutRef} />
      <Portfolio />
    </main>
  );
}
export default Home;
