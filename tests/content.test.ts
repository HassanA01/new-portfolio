import { describe, it, expect } from "vitest";
import { getProjects, getFeaturedProjects, getExperience } from "@/lib/content";

describe("content layer", () => {
  it("returns all projects with required fields", () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(8);
    for (const p of projects) {
      expect(p.title).toBeTruthy();
      expect(p.description).not.toMatch(/<[^>]+>/); // no embedded HTML
      expect(p.image).toMatch(/^\//);
      expect(Array.isArray(p.tech)).toBe(true);
      expect(typeof p.featured).toBe("boolean");
    }
  });

  it("returns exactly the featured projects", () => {
    const titles = getFeaturedProjects().map((p) => p.title);
    expect(titles.sort()).toEqual(["B2W - UofT Hacks 12", "BizReach Marketplace", "MailflowAI", "Myriad CRO Landing Page"].sort());
  });

  it("returns experience with impact lines", () => {
    const exp = getExperience();
    expect(exp[0].company).toBe("Dayforce");
    expect(exp[0].impact).toBe("Built QueryGPT — agentic natural-language SQL over 50K+ tables.");
    for (const e of exp) {
      expect(e.impact).toBeTruthy();
      expect(e.highlights.length).toBeGreaterThan(0);
    }
  });
});
