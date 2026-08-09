import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavPill } from "@/components/ui/NavPill";
import { AgentChatProvider } from "@/components/agent/AgentChatProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

beforeEach(() => {
  // Stub fetch to prevent real network calls from AgentChatProvider's health check
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
    } as Response),
  );
});

const renderWithProvider = (component: React.ReactElement) =>
  render(<AgentChatProvider>{component}</AgentChatProvider>);

describe("NavPill", () => {
  it("renders nav links and the ⌘K chip", () => {
    renderWithProvider(<NavPill />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/#contact");
    expect(screen.getByRole("button", { name: /command menu/i })).toBeInTheDocument();
  });

  it("opens the palette with Cmd+K", async () => {
    renderWithProvider(<NavPill />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
  });

  it("opens the palette with Ctrl+K", async () => {
    renderWithProvider(<NavPill />);
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
  });

  it("chip toggles the palette open then closed", async () => {
    renderWithProvider(<NavPill />);
    const chip = screen.getByRole("button", { name: /command menu/i });
    // first click — palette opens
    await userEvent.click(chip);
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
    // second click — use fireEvent to bypass pointer-events on the modal backdrop
    fireEvent.click(chip);
    expect(screen.queryByPlaceholderText(/type a command/i)).toBeNull();
  });

  it("palette lists quick actions", async () => {
    renderWithProvider(<NavPill />);
    await userEvent.click(screen.getByRole("button", { name: /command menu/i }));
    expect(screen.getByText("Copy email")).toBeInTheDocument();
    expect(screen.getByText("Download resume")).toBeInTheDocument();
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });
});
