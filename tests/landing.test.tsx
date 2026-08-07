import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";

describe("Hero", () => {
  it("renders the headline and CTAs", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("AI engineer.");
    const agentBtn = screen.getByRole("button", { name: "Ask my agent" });
    expect(agentBtn).toHaveAttribute("aria-disabled", "true");
    expect(agentBtn).toHaveAttribute("title", "Coming soon");
    expect(screen.getByRole("link", { name: /view work/i })).toHaveAttribute("href", "/work");
  });
});

describe("SelectedWork", () => {
  it("renders the four featured projects", () => {
    render(<SelectedWork />);
    expect(screen.getByText("MailflowAI")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /all work/i })).toHaveAttribute("href", "/work");
  });
});
