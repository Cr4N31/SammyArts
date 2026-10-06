import Hero from "../components/home/Hero";
import About from "../components/home/About";
import Portfolio from "../components/home/Portfolio";
import CoursesMentor from "../components/home/CoursesMentor";

function Home({ aboutRef }) {
  return (
    <main>
      <Hero />
      <About sectionRef={aboutRef} />
      <Portfolio />
      <CoursesMentor />
    </main>
  );
}
export default Home;
