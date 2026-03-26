import { describe, it, expect } from "vitest";
import { GridLine, Grid } from "../../../src/RBT/Grid";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Every line in a well-formed grid must have the same total length. */
function allSameLength(grid: Grid): boolean {
  return grid.lines.every((line) => line.length === grid.width);
}

// ---------------------------------------------------------------------------
// GridLine
// ---------------------------------------------------------------------------

describe("GridLine", () => {
  it("length is leftOffset + width + rightOffset", () => {
    const line = new GridLine(2, 3, 4);
    expect(line.length).toBe(9);
    expect(line.leftOffset).toBe(2);
    expect(line.width).toBe(3);
    expect(line.rightOffset).toBe(4);
  });

  it("concat merges two lines with a 1-slot gap between them", () => {
    const a = new GridLine(1, 2, 0);
    const b = new GridLine(0, 3, 1);
    const c = a.concat(b);
    expect(c.leftOffset).toBe(1);            // from a
    expect(c.width).toBe(2 + 3 + 1);        // a.width + b.width + gap
    expect(c.rightOffset).toBe(1);           // from b
    expect(c.length).toBe(8);
  });

  it("setLength adjusts width to fill the given total length", () => {
    const line = new GridLine(1, 1, 1); // length = 3
    line.setLength(7);
    expect(line.length).toBe(7);
    expect(line.width).toBe(5); // 7 - 1 (left) - 1 (right)
  });

  it("fromTopline centers parent on an odd-length base", () => {
    // Base length = 5 (odd) → center slot lands at offset 2.
    const base = new GridLine(0, 5, 0);
    const top = GridLine.fromTopline(base, 1, 1);
    expect(top.leftOffset).toBe(2);
    expect(top.width).toBe(1);
    expect(top.rightOffset).toBe(2);
    expect(top.length).toBe(5);
  });

  it("fromTopline nudges right when left offset exceeds right offset", () => {
    // leftOffset=3 > rightOffset=1 on an even-length base (length=4) →
    // parent nudges right (larger leftOffset) to center over the narrower right side.
    const base = new GridLine(3, 0, 1); // length = 4
    const top = GridLine.fromTopline(base, 1, 1);
    expect(top.leftOffset).toBeGreaterThan(top.rightOffset);
    expect(top.length).toBe(4);
  });

  it("fromTopline nudges toward the wider subtree when offsets are equal", () => {
    // Equal offsets (2, 2) on an even-length base: break the tie using
    // subtree widths. The parent should sit closer to the wider side.
    const base = new GridLine(2, 0, 2); // length = 4

    const topLeftWider = GridLine.fromTopline(base, 3, 1);
    const topRightWider = GridLine.fromTopline(base, 1, 3);

    // Wider left subtree → parent shifts right (larger leftOffset).
    expect(topLeftWider.leftOffset).toBeGreaterThan(topRightWider.leftOffset);
    expect(topLeftWider.length).toBe(4);
    expect(topRightWider.length).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Grid constants
// ---------------------------------------------------------------------------

describe("Grid constants", () => {
  it("BLANK has height 1 and a line with zero internal width", () => {
    // BLANK = GridLine(1, 0, 1): leftOffset=1, _width=0, rightOffset=1.
    // Grid.width returns lines[0].length = 1 + 0 + 1 = 2.
    expect(Grid.BLANK.height).toBe(1);
    expect(Grid.BLANK.lines[0].width).toBe(0); // internal _width is 0
    expect(Grid.BLANK.width).toBe(2);          // total line length
  });

  it("LEAF has width 1 and height 1", () => {
    expect(Grid.LEAF.width).toBe(1);
    expect(Grid.LEAF.height).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Grid.merge — base cases
// ---------------------------------------------------------------------------

describe("Grid.merge — base cases", () => {
  it("merge(BLANK, BLANK) returns the LEAF singleton", () => {
    expect(Grid.merge(Grid.BLANK, Grid.BLANK)).toBe(Grid.LEAF);
  });

  it("merge(LEAF, BLANK) produces a valid 2-level grid", () => {
    const merged = Grid.merge(Grid.LEAF, Grid.BLANK);
    expect(merged.height).toBe(2);
    expect(allSameLength(merged)).toBe(true);
  });

  it("merge(BLANK, LEAF) produces a valid 2-level grid", () => {
    const merged = Grid.merge(Grid.BLANK, Grid.LEAF);
    expect(merged.height).toBe(2);
    expect(allSameLength(merged)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Grid.merge — equal height
// ---------------------------------------------------------------------------

describe("Grid.merge — equal height", () => {
  it("merge(LEAF, LEAF) produces a 2-level grid of width 3", () => {
    // Root level (1 node) + leaf level (left + gap + right = 3 slots).
    const merged = Grid.merge(Grid.LEAF, Grid.LEAF);
    expect(merged.height).toBe(2);
    expect(merged.width).toBe(3);
    expect(allSameLength(merged)).toBe(true);
  });

  it("all lines have the same total length at every depth", () => {
    const depth2 = Grid.merge(Grid.LEAF, Grid.LEAF);
    const depth3a = Grid.merge(depth2, Grid.LEAF);   // left subtree deeper
    const depth3b = Grid.merge(Grid.LEAF, depth2);   // right subtree deeper
    const depth3c = Grid.merge(depth2, depth2);       // balanced

    expect(allSameLength(depth2)).toBe(true);
    expect(allSameLength(depth3a)).toBe(true);
    expect(allSameLength(depth3b)).toBe(true);
    expect(allSameLength(depth3c)).toBe(true);
  });

  it("parent line sits within the grid's horizontal bounds", () => {
    const merged = Grid.merge(Grid.LEAF, Grid.LEAF);
    const parentLine = merged.lines[0];
    expect(parentLine.leftOffset).toBeGreaterThanOrEqual(0);
    expect(parentLine.rightOffset).toBeGreaterThanOrEqual(0);
    expect(parentLine.length).toBe(merged.width);
  });

  it("height grows by 1 with each merge level", () => {
    const d2 = Grid.merge(Grid.LEAF, Grid.LEAF);           // height 2
    const d3 = Grid.merge(d2, d2);                          // height 3
    const d4 = Grid.merge(d3, d3);                          // height 4
    expect(d2.height).toBe(2);
    expect(d3.height).toBe(3);
    expect(d4.height).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Grid.merge — unequal height
// ---------------------------------------------------------------------------

describe("Grid.merge — unequal height", () => {
  it("taller left subtree produces a valid grid one level taller", () => {
    const tall = Grid.merge(Grid.LEAF, Grid.LEAF); // height 2
    const merged = Grid.merge(tall, Grid.LEAF);    // height 3
    expect(merged.height).toBe(tall.height + 1);
    expect(allSameLength(merged)).toBe(true);
  });

  it("taller right subtree produces a valid grid one level taller", () => {
    const tall = Grid.merge(Grid.LEAF, Grid.LEAF);
    const merged = Grid.merge(Grid.LEAF, tall);
    expect(merged.height).toBe(tall.height + 1);
    expect(allSameLength(merged)).toBe(true);
  });

  it("deeply right-skewed chain stays valid at every level", () => {
    // Simulates a right-leaning tree: each step adds one level on the right.
    let grid = Grid.LEAF;
    for (let i = 0; i < 6; i++) {
      grid = Grid.merge(Grid.LEAF, grid);
      expect(allSameLength(grid)).toBe(true);
    }
  });

  it("deeply left-skewed chain stays valid at every level", () => {
    let grid = Grid.LEAF;
    for (let i = 0; i < 6; i++) {
      grid = Grid.merge(grid, Grid.LEAF);
      expect(allSameLength(grid)).toBe(true);
    }
  });
});
