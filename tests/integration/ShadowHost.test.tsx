// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import ShadowHost from "../../src/TreeVisualizer/ShadowHost";

describe("ShadowHost", () => {
  it("renders without errors", () => {
    expect(() => render(<ShadowHost />)).not.toThrow();
  });

  it("attaches a shadow root to the host element", async () => {
    const { container } = render(<ShadowHost />);
    const host = container.firstChild as HTMLElement;
    await waitFor(() => {
      expect(host.shadowRoot).not.toBeNull();
    });
  });

  it("shadow root contains a child element for the portal", async () => {
    const { container } = render(<ShadowHost />);
    const host = container.firstChild as HTMLElement;
    await waitFor(() => {
      expect(host.shadowRoot?.childElementCount).toBeGreaterThan(0);
    });
  });
});
