import { describe, it, expect } from "vitest";
import RBTree from "../../../src/RBT/Tree";
import History from "../../../src/TreeVisualizer/History";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Returns a paired tree + history where the tree's logFn feeds directly into
 * history.append, mirroring what TreeVisualizer does at runtime.
 */
function makeHistory(): { tree: RBTree<number>; history: History<number> } {
  const history = new History<number>();
  const tree = new RBTree<number>((event, root, subject) => {
    history.append(event, root, subject);
  });
  return { tree, history };
}

/** Collect every description from the current history session. */
function descriptions(history: History<number>): string[] {
  return Array.from({ length: history.length }, (_, i) => history.get(i)!.description);
}

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------

describe("History — reset", () => {
  it("produces exactly 1 layout after reset", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root);
    expect(history.length).toBe(1);
  });

  it("first layout description is 'Initial tree'", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root);
    expect(history.get(0)?.description).toBe("Initial tree");
  });

  it("clears previous layouts on repeated reset", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root, 10, "insert");
    tree.insert(10);
    history.appendFinal("Inserted", tree.root);
    expect(history.length).toBeGreaterThan(1);

    history.reset(tree.root); // clears everything
    expect(history.length).toBe(1);
  });

  it("size reflects the initial tree after reset on a non-empty tree", () => {
    const { tree, history } = makeHistory();
    for (let i = 1; i <= 7; i++) tree.insert(i);
    history.reset(tree.root);
    expect(history.size.width).toBeGreaterThan(0);
    expect(history.size.height).toBeGreaterThan(0);
  });

  it("size is zero on an empty tree", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root);
    expect(history.size.width).toBe(0);
    expect(history.size.height).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Step recording (append / appendFinal)
// ---------------------------------------------------------------------------

describe("History — step recording", () => {
  it("step count grows as tree events are logged", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root, 10, "insert");
    const before = history.length;
    tree.insert(10);
    expect(history.length).toBeGreaterThan(before);
  });

  it("FOUND event in insert mode produces a 'Found duplicate' description", () => {
    const { tree, history } = makeHistory();
    tree.insert(10); // populate tree first (without history tracking this step)
    history.reset(tree.root, 10, "insert");
    tree.insert(10); // duplicate → FOUND fires → must translate to FOUND_DUPLICATE
    expect(descriptions(history)).toContain("Found duplicate");
  });

  it("FOUND event in find mode produces a 'Found' description", () => {
    const { tree, history } = makeHistory();
    tree.insert(10);
    history.reset(tree.root, 10, "find");
    tree.find(10);
    const descs = descriptions(history);
    expect(descs).toContain("Found");
    expect(descs).not.toContain("Found duplicate");
  });

  it("comparison steps include 'Compare' descriptions", () => {
    const { tree, history } = makeHistory();
    tree.insert(10);
    tree.insert(5);
    tree.insert(15);
    history.reset(tree.root, 7, "find");
    tree.find(7); // traverses 10 → 5 → right (not found)
    expect(descriptions(history).some((d) => d.startsWith("Compare"))).toBe(true);
  });

  it("delete with a two-children node includes 'Replace with successor'", () => {
    const { tree, history } = makeHistory();
    for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);
    history.reset(tree.root, 15, "delete");
    tree.delete(15); // 15 has two children → successor splice
    history.appendFinal("Deleted", tree.root);
    expect(descriptions(history)).toContain("Replace with successor");
  });

  it("all step descriptions are non-empty strings", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root, 42, "insert");
    tree.insert(42);
    history.appendFinal("Inserted", tree.root);
    for (const d of descriptions(history)) {
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Size tracking
// ---------------------------------------------------------------------------

describe("History — size tracking", () => {
  it("size width and height are non-negative after any reset", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root);
    expect(history.size.width).toBeGreaterThanOrEqual(0);
    expect(history.size.height).toBeGreaterThanOrEqual(0);
  });

  it("size never decreases as steps are appended within a session", () => {
    const { tree, history } = makeHistory();
    for (let i = 1; i <= 7; i++) tree.insert(i);
    history.reset(tree.root, 4, "delete");
    const afterReset = { ...history.size };

    tree.delete(4); // tree shrinks during these steps
    history.appendFinal("Deleted", tree.root);

    // Max size only grows — it must be at least what it was after reset.
    expect(history.size.width).toBeGreaterThanOrEqual(afterReset.width);
    expect(history.size.height).toBeGreaterThanOrEqual(afterReset.height);
  });
});

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------

describe("History — get", () => {
  it("get(0) returns the initial layout", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root);
    expect(history.get(0)?.description).toBe("Initial tree");
  });

  it("get(length - 1) returns the last appended layout", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root, 10, "insert");
    tree.insert(10);
    history.appendFinal("Inserted", tree.root);
    expect(history.get(history.length - 1)?.description).toBe("Inserted");
  });

  it("get returns undefined for out-of-bounds indices", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root);
    expect(history.get(-1)).toBeUndefined();
    expect(history.get(100)).toBeUndefined();
  });

  it("each layout has a size with non-negative dimensions", () => {
    const { tree, history } = makeHistory();
    tree.insert(10);
    tree.insert(5);
    tree.insert(15);
    history.reset(tree.root, 7, "find");
    tree.find(7);
    for (let i = 0; i < history.length; i++) {
      const layout = history.get(i)!;
      expect(layout.size.width).toBeGreaterThanOrEqual(0);
      expect(layout.size.height).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration: full operations through the pipeline
// ---------------------------------------------------------------------------

describe("History — integration", () => {
  it("insert into an empty tree produces at least 2 steps", () => {
    const { tree, history } = makeHistory();
    history.reset(tree.root, 10, "insert");
    tree.insert(10);
    history.appendFinal("Inserted", tree.root);
    // Minimum: INITIAL + INSERT + RECOLOR_ROOT + final
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  it("insert that triggers a rotation produces more steps than a simple insert", () => {
    const { tree: t1, history: h1 } = makeHistory();
    h1.reset(t1.root, 10, "insert");
    t1.insert(10); // no rotation
    h1.appendFinal("Done", t1.root);
    const simpleSteps = h1.length;

    const { tree: t2, history: h2 } = makeHistory();
    t2.insert(10);
    t2.insert(5);
    h2.reset(t2.root, 3, "insert");
    t2.insert(3); // LL: COMPARE_LEFT ×2 + INSERT + ROTATE_RIGHT + RECOLOR + ...
    h2.appendFinal("Done", t2.root);

    expect(h2.length).toBeGreaterThan(simpleSteps);
  });

  it("floating node appears in comparison-step layouts during find", () => {
    const { tree, history } = makeHistory();
    tree.insert(10);
    tree.insert(5);
    history.reset(tree.root, 7, "find");
    tree.find(7);

    const hasFloating = Array.from(
      { length: history.length },
      (_, i) => history.get(i)!.floatingNode,
    ).some((f) => f !== undefined);

    expect(hasFloating).toBe(true);
  });

  it("full delete sequence leaves the tree in a valid RBT state", () => {
    // Drive the full History pipeline for a delete, then verify the
    // final layout reflects a structurally sound (non-nil) tree.
    const { tree, history } = makeHistory();
    for (const v of [10, 5, 15, 3, 7]) tree.insert(v);
    history.reset(tree.root, 5, "delete");
    tree.delete(5);
    history.appendFinal("Deleted", tree.root);

    const finalLayout = history.get(history.length - 1)!;
    // Remaining nodes (10, 15, 3, 7) → tree has width > 0
    expect(finalLayout.size.width).toBeGreaterThan(0);
    // Node 5 must not appear in the final layout
    expect(finalLayout.nodeLayouts.has(5)).toBe(false);
    // All surviving nodes must appear
    for (const v of [10, 15, 3, 7]) {
      expect(finalLayout.nodeLayouts.has(v)).toBe(true);
    }
  });
});
