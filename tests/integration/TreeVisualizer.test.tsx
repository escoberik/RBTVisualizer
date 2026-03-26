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

  it("shows 'Insert a value to begin' as the initial description", () => {
    setup();
    expect(screen.getByRole("status")).toHaveTextContent("Insert a value to begin");
  });

  it("does not show step navigation before any operation", () => {
    setup();
    // StepNav only renders when history.length > 1.
    expect(screen.queryByLabelText(/^Step \d+$/)).not.toBeInTheDocument();
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

  it("shows step navigation after a button insert", async () => {
    const { user, input, insertBtn } = setup();
    await insert(user, input, insertBtn, 42);
    // At least two steps exist once an insert runs.
    expect(screen.getByLabelText("Step 2")).toBeInTheDocument();
  });

  it("starts at step 1 and description is 'Insert a value to begin' at step 0", async () => {
    // Step 0 of the first insert is a snapshot of the empty tree, so the
    // empty-state description applies even though an operation is in progress.
    const { user, input, insertBtn } = setup();
    await insert(user, input, insertBtn, 42);
    expect(screen.getByRole("status")).toHaveTextContent("Insert a value to begin");
    expect(screen.getByLabelText("Step 1")).toHaveAttribute("aria-current", "step");
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

  it("Prev returns to the empty-state description from step 2", async () => {
    const { user, input, insertBtn, nextBtn, prevBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(nextBtn);
    await user.click(prevBtn);
    expect(screen.getByRole("status")).toHaveTextContent("Insert a value to begin");
  });

  it("Last jumps to the final step", async () => {
    const { user, input, insertBtn, lastBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(lastBtn);
    // The last dot in the step nav should be current.
    const stepBtns = screen.getAllByRole("button", { name: /^Step \d+$/ });
    expect(stepBtns[stepBtns.length - 1]).toHaveAttribute("aria-current", "step");
  });

  it("First returns to the empty-state description from the last step", async () => {
    const { user, input, insertBtn, lastBtn, firstBtn } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(lastBtn);
    await user.click(firstBtn);
    expect(screen.getByRole("status")).toHaveTextContent("Insert a value to begin");
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
  it("ArrowRight advances past the empty-state description", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "ArrowRight" });
    expect(screen.getByRole("status")).not.toHaveTextContent("Insert a value to begin");
  });

  it("ArrowLeft goes back to the empty-state description after advancing", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "ArrowRight" });
    fireEvent.keyDown(visualizer, { key: "ArrowLeft" });
    expect(screen.getByRole("status")).toHaveTextContent("Insert a value to begin");
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

describe("TreeVisualizer reset", () => {
  it("first r press arms reset — tree is not cleared yet", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(screen.getByTitle("Last step"));
    fireEvent.keyDown(visualizer, { key: "r" });
    // Tree still has nodes; empty-state prompt is absent
    expect(
      screen.queryByText("Insert a value to begin"),
    ).not.toBeInTheDocument();
  });

  it("second r press confirms and clears the tree", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "r" });
    fireEvent.keyDown(visualizer, { key: "r" });
    expect(screen.getByText("Insert a value to begin")).toBeInTheDocument();
  });

  it("R (uppercase) works for both arm and confirm", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    fireEvent.keyDown(visualizer, { key: "R" });
    fireEvent.keyDown(visualizer, { key: "R" });
    expect(screen.getByText("Insert a value to begin")).toBeInTheDocument();
  });

  it("any other key disarms reset without clearing the tree", async () => {
    const { user, input, insertBtn, visualizer } = setup();
    await insert(user, input, insertBtn, 5);
    await user.click(screen.getByTitle("Last step"));
    fireEvent.keyDown(visualizer, { key: "r" });
    fireEvent.keyDown(visualizer, { key: "ArrowLeft" }); // disarms
    fireEvent.keyDown(visualizer, { key: "r" });          // arms again, no reset
    expect(
      screen.queryByText("Insert a value to begin"),
    ).not.toBeInTheDocument();
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

  it("starts with no step navigation (single initial snapshot)", () => {
    setup({ initialValues: [15, 8, 22] });
    // history.reset() after seeding collapses everything to one snapshot
    expect(screen.queryByLabelText(/^Step \d+$/)).not.toBeInTheDocument();
  });
});
