// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Controls from "../../src/TreeVisualizer/Controls";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProps(overrides = {}) {
  // prettier-ignore
  return {
    onInsert:          vi.fn(),
    onFind:            vi.fn(),
    onDelete:          vi.fn(),
    onNext:            vi.fn(),
    onPrev:            vi.fn(),
    onFirst:           vi.fn(),
    onLast:            vi.fn(),
    onValidationError: vi.fn(),
    isFirst:           false,
    isLast:            false,
    min:               -9999,
    max:               99999,
    ...overrides,
  };
}

function setup(overrides = {}) {
  const props = makeProps(overrides);
  const user = userEvent.setup();
  render(<Controls {...props} />);
  const input = screen.getByRole("spinbutton");
  return { user, props, input };
}

// ---------------------------------------------------------------------------
// Validation — invalid inputs
// ---------------------------------------------------------------------------

describe("Controls input validation", () => {
  it("marks input invalid and does not call onInsert for empty value", async () => {
    const { user, props, input } = setup();
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).toHaveClass("invalid");
    expect(props.onInsert).not.toHaveBeenCalled();
  });

  it("marks input invalid for zero", async () => {
    const { user, props, input } = setup();
    await user.type(input, "0");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).not.toHaveClass("invalid");
    expect(props.onInsert).toHaveBeenCalledWith(0);
  });

  it("accepts a negative number within range", async () => {
    const { user, props, input } = setup();
    await user.type(input, "-5");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).not.toHaveClass("invalid");
    expect(props.onInsert).toHaveBeenCalledWith(-5);
  });

  it("marks input invalid for a value below -9999", async () => {
    const { user, props, input } = setup();
    await user.type(input, "-10000");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).toHaveClass("invalid");
    expect(props.onInsert).not.toHaveBeenCalled();
  });

  it("marks input invalid for a decimal", async () => {
    const { user, props, input } = setup();
    await user.type(input, "3.5");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).toHaveClass("invalid");
    expect(props.onInsert).not.toHaveBeenCalled();
  });

  it("marks input invalid for a value above 99999", async () => {
    const { user, props, input } = setup();
    await user.type(input, "100000");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).toHaveClass("invalid");
    expect(props.onInsert).not.toHaveBeenCalled();
  });

  it("clears the invalid state as soon as the user types again", async () => {
    const { user, props, input } = setup();
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(input).toHaveClass("invalid");
    await user.type(input, "1");
    expect(props.onInsert).not.toHaveBeenCalled();
    expect(input).not.toHaveClass("invalid");
  });
});

// ---------------------------------------------------------------------------
// Buttons — valid input dispatches and clears
// ---------------------------------------------------------------------------

describe("Controls buttons", () => {
  it("Insert calls onInsert with the parsed value and clears the input", async () => {
    const { user, props, input } = setup();
    await user.type(input, "42");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(props.onInsert).toHaveBeenCalledWith(42);
    expect(input).toHaveValue(null); // cleared
  });

  it("Find calls onFind with the parsed value and clears the input", async () => {
    const { user, props, input } = setup();
    await user.type(input, "10");
    await user.click(screen.getByRole("button", { name: "Find" }));
    expect(props.onFind).toHaveBeenCalledWith(10);
    expect(input).toHaveValue(null);
  });

  it("Delete calls onDelete with the parsed value and clears the input", async () => {
    const { user, props, input } = setup();
    await user.type(input, "7");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(props.onDelete).toHaveBeenCalledWith(7);
    expect(input).toHaveValue(null);
  });

  it("Insert does not call onLast (buttons start at step 0)", async () => {
    const { user, props, input } = setup();
    await user.type(input, "1");
    await user.click(screen.getByRole("button", { name: "Insert" }));
    expect(props.onLast).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Keyboard shortcuts — fast-forward to last step
// ---------------------------------------------------------------------------

describe("Controls keyboard shortcuts", () => {
  it("Enter calls onInsert and onLast", async () => {
    const { user, props, input } = setup();
    await user.type(input, "5");
    await user.keyboard("{Enter}");
    expect(props.onInsert).toHaveBeenCalledWith(5);
    expect(props.onLast).toHaveBeenCalled();
  });

  it("f calls onFind and onLast", async () => {
    const { user, props, input } = setup();
    await user.type(input, "5");
    await user.keyboard("f");
    expect(props.onFind).toHaveBeenCalledWith(5);
    expect(props.onLast).toHaveBeenCalled();
  });

  it("F (uppercase) calls onFind and onLast", async () => {
    const { user, props, input } = setup();
    await user.type(input, "5");
    await user.keyboard("F");
    expect(props.onFind).toHaveBeenCalledWith(5);
    expect(props.onLast).toHaveBeenCalled();
  });

  it("Delete key calls onDelete and onLast", async () => {
    const { user, props, input } = setup();
    await user.type(input, "5");
    await user.keyboard("{Delete}");
    expect(props.onDelete).toHaveBeenCalledWith(5);
    expect(props.onLast).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Nav buttons — disabled state
// ---------------------------------------------------------------------------

describe("Controls nav buttons", () => {
  it("First and Prev are disabled when isFirst=true", () => {
    setup({ isFirst: true });
    expect(screen.getByTitle("First step")).toBeDisabled();
    expect(screen.getByTitle("Previous step")).toBeDisabled();
  });

  it("Next and Last are disabled when isLast=true", () => {
    setup({ isLast: true });
    expect(screen.getByTitle("Next step")).toBeDisabled();
    expect(screen.getByTitle("Last step")).toBeDisabled();
  });

  it("all nav buttons are enabled when neither isFirst nor isLast", () => {
    setup({ isFirst: false, isLast: false });
    expect(screen.getByTitle("First step")).not.toBeDisabled();
    expect(screen.getByTitle("Previous step")).not.toBeDisabled();
    expect(screen.getByTitle("Next step")).not.toBeDisabled();
    expect(screen.getByTitle("Last step")).not.toBeDisabled();
  });

  it("Next calls onNext", async () => {
    const { user, props } = setup();
    await user.click(screen.getByTitle("Next step"));
    expect(props.onNext).toHaveBeenCalled();
  });

  it("Prev calls onPrev", async () => {
    const { user, props } = setup({ isFirst: false });
    await user.click(screen.getByTitle("Previous step"));
    expect(props.onPrev).toHaveBeenCalled();
  });
});
