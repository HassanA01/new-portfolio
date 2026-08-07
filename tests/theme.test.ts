import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme, getStoredTheme, resolveTheme } from "@/lib/theme";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("applyTheme sets the attribute and persists", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("resolveTheme prefers the stored value", () => {
    applyTheme("light");
    expect(resolveTheme()).toBe("light");
  });

  it("resolveTheme falls back to system preference when nothing stored", () => {
    // jsdom matchMedia is undefined; resolveTheme must not throw and defaults dark
    expect(resolveTheme()).toBe("dark");
  });
});
