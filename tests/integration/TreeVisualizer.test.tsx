// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TreeVisualizer from "../../src/TreeVisualizer/TreeVisualizer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup(
  props: {
    initialValues?: number[];
    initialRandomCount?: number;
  } = {},
) {
  const user = userEvent.setup();
  render(<TreeVisualizer {...props} />);
  // prettier-ignore
  return {
    user,
    get input()     { return screen.getByRole("spinbutton"); },
    get insertBtn() { return screen.getByRole("button", { name: "Insert" }); },
    get findBtn()   { return screen.getByRole("button", { name: "Find" }); },
    get deleteBtn() { return screen.getByRole("button", { name: "Delete" }); },
    get nextBtn()   { return screen.getByTitle("Next step"); },
    get prevBtn()   { return screen.getByTitle("Previous step"); },
    get firstBtn()  { return screen.getByTitle("First step"); },
    get lastBtn()   { return screen.getByTitle("Last step"); },
    get status()    { return screen.getByRole("status"); },
    get visualizer() {
      return document.querySelector(
        '[aria-label="Red-Black Tree Visualizer"]',
      ) as HTMLElement;
    },
  };
}

async function insert(
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLElement,
  insertBtn: HTMLElement,
  value: number,
) {
  await user.clear(input);
  await user.type(input, String(value));
  await user.click(insertBtn);
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe("TreeVisualizer empty state", () => {
  it("shows the empty-state prompt on first render", () => {
    setup();
    expect(screen.getByText("Insert a value to begin")).toBeInTheDocument();
  });

  it("shows 'Initial tree' as the initial description", () => {
    setup();
    expect(screen.getByRole("status")).toHaveTextContent("Initial tree");
  });

  it("does not show a step counter before any operation", () => {
    setup();
    // Step counter only appears when history.length > 1.
    // "1 /" would appear in any counter of the form "1 / N".
    expect(screen.getByRole("status").textContent).not.toMatch(/\d+ \/ \d+/);
  });
});

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

describe("TreeVisualizer insert", () => {
  it("button insert starts at step 0 — empty-state prompt still visible", async () => {
    // Step 0 is a snapshot of the tree *before* the insert, so the tree is
    // empty and the empty-state prompt remains. This is by design: buttons
    // always start from the beginning of the operation.
    const { user, input, insertBtn } = setup();
    await insert(user, input, insertBtn, 42);
    expect(screen.getByText("Insert a value to begin")).toBeInTheDocument();
  });

  it("shows a step counter after a button insert", async () => {
    const { user, input, insertBtn } = setup();
    await insert(user, input, insertBtn, 42);
    expect(screen.getByRole("status").textContent).toMatch(/\d+ \/ \d+/);
  });

  it("step counter starts at 1 and description is 'Initial tree' at step 0", async () => {
    const { user, input, insertBtn } = setup();
    await insert(user, input, insertBtn, 42);
    expect(screen.getByRole("status").textContent).toMatch(
      /^Initial tree1 \/ \d+/,
    );
  });

  it("Enter fast-forwards to the last step — empty-state prompt gone", async () => {
    const { user, input } = setup();
    await user.type(input, "42");
    await user.keyboard("{Enter}");
    expect(
      screen.queryByText("Insert a value to begin"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent("Initial tree");
  });
});

// ---------------------------------------------------------------------------
// Step navigation — buttons
// ---------------------------------------------------------------------------

describe("TreeVisualizer step navigation via buttons", () => {
  it("Next advances the description past 'Initial tree'", async () => {
    const { user, input, insertBtn, nextBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(nextBtn);
    expect(screen.getByRole("status")).not.toHaveTextContent("Initial tree");
  });

  it("Prev returns to 'Initial tree' from step 2", async () => {
    const { user, input, insertBtn, nextBtn, prevBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(nextBtn);
    await user.click(prevBtn);
    expect(screen.getByRole("status")).toHaveTextContent("Initial tree");
  });

  it("Last jumps to the final step", async () => {
    const { user, input, insertBtn, lastBtn, status } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(lastBtn);
    const text = status.textContent ?? "";
    // Counter "N / N" — both numbers are the same
    const match = text.match(/(\d+) \/ (\d+)/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(match![2]);
  });

  it("First returns to step 1 from the last step", async () => {
    const { user, input, insertBtn, lastBtn, firstBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(lastBtn);
    await user.click(firstBtn);
    expect(screen.getByRole("status")).toHaveTextContent("Initial tree");
  });

  it("Prev is disabled on the first step", async () => {
    const { user, input, insertBtn, prevBtn } = setup();
    await insert(user, input, insertBtn, 5);
    expect(prevBtn).toBeDisabled();
  });

  it("Next is disabled on the last step", async () => {
    const { user, input, insertBtn, lastBtn, nextBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(lastBtn);
    expect(nextBtn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Step navigation — keyboard
// ---------------------------------------------------------------------------

describe("TreeVisualizer step navigation via keyboard", () => {
  it("ArrowRight advances the description", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "ArrowRight" });
    expect(screen.getByRole("status")).not.toHaveTextContent("Initial tree");
  });

  it("ArrowLeft goes back after advancing", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "ArrowRight" });
    fireEvent.keyDown(visualizer, { key: "ArrowLeft" });
    expect(screen.getByRole("status")).toHaveTextContent("Initial tree");
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

describe("TreeVisualizer reset", () => {
  it("r key clears the tree and restores the empty-state prompt", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "r" });
    expect(screen.getByText("Insert a value to begin")).toBeInTheDocument();
  });

  it("R (uppercase) also resets", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "R" });
    expect(screen.getByText("Insert a value to begin")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// initialValues prop
// ---------------------------------------------------------------------------

describe("TreeVisualizer initialValues prop", () => {
  it("pre-populates the tree (no empty-state prompt)", () => {
    setup({ initialValues: [15, 8, 22] });
    expect(
      screen.queryByText("Insert a value to begin"),
    ).not.toBeInTheDocument();
  });

  it("starts at step 1 with no step counter (single initial snapshot)", () => {
    setup({ initialValues: [15, 8, 22] });
    // history.reset() after seeding collapses everything to one snapshot
    expect(screen.getByRole("status").textContent).not.toMatch(/\d+ \/ \d+/);
  });
});
