import type { Metadata } from "next";
import { cookies } from "next/headers";
import AboutSections from "@/components/AboutSections";

// Update this Toronto calendar date when the About content changes.
const aboutUpdatedOn = "2026-11-08";
const aboutUpdatedLabel = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(new Date(aboutUpdatedOn));

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
      <p className="page-updated">
        Last updated at{" "}
        <time dateTime={aboutUpdatedOn}>{aboutUpdatedLabel}</time>
      </p>
      <AboutSections initialCareerView={initialCareerView} />
    </main>
  );
}
