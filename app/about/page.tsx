import type { Metadata } from "next";
import { cookies } from "next/headers";
import AboutSections from "@/components/AboutSections";
import { projectsUpdatedLabel } from "@/lib/projects-updated";

export const metadata: Metadata = {
  title: "About me",
  description:
    "Aneeq Hassan’s background, career journey, projects, and current interests.",
};

export default async function About() {
  const savedView = (await cookies()).get("career-view")?.value;
  const initialCareerView = savedView === "Story" ? "Story" : "Condensed";
  return (
    <main id="main-content" className="page-content about-page">
      <h1>About me</h1>
      <p className="page-updated">Last updated at {projectsUpdatedLabel()}</p>
      <AboutSections initialCareerView={initialCareerView} />
    </main>
  );
}
