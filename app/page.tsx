import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { AboutStrip } from "@/components/sections/AboutStrip";
import { ContactStrip } from "@/components/sections/ContactStrip";

export default function Home() {
  return (
    <main>
      <Hero />
      <SelectedWork />
      <ExperienceTimeline compact />
      <AboutStrip />
      <ContactStrip />
    </main>
  );
}
