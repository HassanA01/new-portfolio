import About from "@/components/About";
import ExperienceMobile from "@/components/Experience/Experience";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <About />
      <div className="sm:hidden">
        <ExperienceMobile />
      </div>
    </div>
  );
}
