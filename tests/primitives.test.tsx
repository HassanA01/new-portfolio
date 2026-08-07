import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlassButton } from "@/components/ui/GlassButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

describe("GlassButton", () => {
  it("renders an anchor when href is given", () => {
    render(<GlassButton href="/work">View work</GlassButton>);
    expect(screen.getByRole("link", { name: "View work" })).toHaveAttribute("href", "/work");
  });

  it("renders a disabled button with hint", () => {
    render(<GlassButton disabled disabledHint="Coming soon">Ask my agent</GlassButton>);
    const btn = screen.getByRole("button", { name: "Ask my agent" });
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveAttribute("title", "Coming soon");
  });
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute("data-theme", "dark");
  });

  it("toggles the theme and persists", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
