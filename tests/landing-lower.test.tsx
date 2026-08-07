import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { ContactStrip } from "@/components/sections/ContactStrip";
import { AboutStrip } from "@/components/sections/AboutStrip";

describe("ExperienceTimeline", () => {
  it("compact mode lists every role with its impact line, no bullets", () => {
    render(<ExperienceTimeline compact />);
    expect(screen.getByText("Dayforce")).toBeInTheDocument();
    expect(screen.getByText(/QueryGPT/)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /highlights/i })).not.toBeInTheDocument();
  });

  it("full mode renders highlight bullets", () => {
    render(<ExperienceTimeline />);
    expect(screen.getAllByRole("list", { name: /highlights/i }).length).toBeGreaterThan(0);
  });
});

describe("AboutStrip", () => {
  it("renders three punch values and link to /about", () => {
    render(<AboutStrip />);
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("2,000+")).toBeInTheDocument();
    expect(screen.getByText("$2M")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /more about me/i })).toHaveAttribute("href", "/about");
  });
});

describe("ContactStrip", () => {
  it("renders email, socials, and resume", () => {
    render(<ContactStrip />);
    expect(screen.getByRole("link", { name: /hassan\.aneeq01@gmail\.com/i })).toHaveAttribute(
      "href",
      "mailto:hassan.aneeq01@gmail.com",
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/HassanA01");
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /resume/i })).toHaveAttribute("href", "/AneeqHassan.pdf");
  });
});
