import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkPage from "@/app/work/page";
import AboutPage from "@/app/about/page";
import NotFound from "@/app/not-found";

describe("pages", () => {
  it("/work renders every project", () => {
    render(<WorkPage />);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(8);
  });

  it("/about renders narrative and grouped skills", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
  });

  it("404 speaks the design language", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
  });
});
