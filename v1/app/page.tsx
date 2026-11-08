import About from "@/components/About";
import ExperienceWeb from "@/components/Experience/ExperienceWeb";
import ExperienceMobile from "@/components/Experience/Mobile/ExperienceMobile";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero/Hero";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <div className="sm:hidden">
        <ExperienceMobile />
      </div>
      <div className="hidden sm:block">
        <ExperienceWeb />
      </div>
      <Projects />
      <Skills />
      <Footer />
    </div>
  );
}
