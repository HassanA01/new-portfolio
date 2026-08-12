import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom lacks ResizeObserver — cmdk uses it internally
if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  (window as unknown as Record<string, unknown>).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom lacks IntersectionObserver — framer-motion uses it
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as unknown as Record<string, unknown>).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom lacks scrollIntoView — cmdk may call it when highlighting items
Element.prototype.scrollIntoView ||= () => {};

afterEach(() => {
  cleanup();
});
