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
    expect(titles).toContain("MailflowAI");
    expect(titles).toHaveLength(4);
  });

  it("returns experience with impact lines", () => {
    const exp = getExperience();
    expect(exp[0].company).toBe("Dayforce");
    for (const e of exp) {
      expect(e.impact).toBeTruthy();
      expect(e.highlights.length).toBeGreaterThan(0);
    }
  });
});
