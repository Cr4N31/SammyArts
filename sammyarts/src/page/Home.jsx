import Hero from "../components/home/Hero";
import About from "../components/home/About";
import Portfolio from "../components/home/Portfolio";
import CoursesMentor from "../components/home/CoursesMentor";
import Confessions from "../components/home/Confessions";

function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Portfolio />
      <CoursesMentor />
      <Confessions />
    </main>
  );
}
export default Home;
