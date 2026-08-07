import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavPill } from "@/components/ui/NavPill";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

describe("NavPill", () => {
  it("renders nav links and the ⌘K chip", () => {
    render(<NavPill />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/#contact");
    expect(screen.getByRole("button", { name: /command menu/i })).toBeInTheDocument();
  });

  it("opens the palette with Cmd+K", async () => {
    render(<NavPill />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
  });

  it("palette lists quick actions", async () => {
    render(<NavPill />);
    await userEvent.click(screen.getByRole("button", { name: /command menu/i }));
    expect(screen.getByText("Copy email")).toBeInTheDocument();
    expect(screen.getByText("Download resume")).toBeInTheDocument();
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });
});
