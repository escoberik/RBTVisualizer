import { describe, it, expect } from "vitest";
import { freeze, interpolate } from "../../../src/TreeVisualizer/rendering/useLayoutTransition";
import type Snapshot from "../../../src/TreeVisualizer/rendering/Snapshot";
import type { NodeLayout, EdgeDef, FloatingNode } from "../../../src/TreeVisualizer/rendering/Snapshot";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLayout(
  nodeLayouts: Map<number, NodeLayout>,
  edges: EdgeDef<number>[] = [],
  floatingNode?: FloatingNode<number>,
  description = "test",
): Snapshot<number> {
  return {
    description,
    size: { width: 3, height: 3 },
    nodeLayouts: nodeLayouts as ReadonlyMap<number, NodeLayout>,
    edges: edges as ReadonlyArray<EdgeDef<number>>,
    floatingNode,
  } as Snapshot<number>;
}

function makeNode(
  offset: number,
  level: number,
  red = false,
  highlight = false,
): NodeLayout {
  return { offset, level, red, highlight };
}

// ---------------------------------------------------------------------------
// freeze
// ---------------------------------------------------------------------------

describe("freeze", () => {
  it("copies offset and level verbatim", () => {
    const layout = makeLayout(new Map([[10, makeNode(3, 2)]]));
    const result = freeze(layout);
    const node = result.nodeLayouts.get(10)!;
    expect(node.offset).toBe(3);
    expect(node.level).toBe(2);
  });

  it("sets opacity and scale to 1", () => {
    const layout = makeLayout(new Map([[10, makeNode(0, 0)]]));
    const node = freeze(layout).nodeLayouts.get(10)!;
    expect(node.opacity).toBe(1);
    expect(node.scale).toBe(1);
  });

  it("maps red=true → colorT=1", () => {
    const layout = makeLayout(new Map([[10, makeNode(0, 0, true)]]));
    expect(freeze(layout).nodeLayouts.get(10)!.colorT).toBe(1);
  });

  it("maps red=false → colorT=0", () => {
    const layout = makeLayout(new Map([[10, makeNode(0, 0, false)]]));
    expect(freeze(layout).nodeLayouts.get(10)!.colorT).toBe(0);
  });

  it("maps highlight=true → highlightT=1", () => {
    const layout = makeLayout(new Map([[10, makeNode(0, 0, false, true)]]));
    expect(freeze(layout).nodeLayouts.get(10)!.highlightT).toBe(1);
  });

  it("preserves all nodes", () => {
    const layout = makeLayout(new Map([[1, makeNode(0, 0)], [2, makeNode(1, 0)]]));
    expect(freeze(layout).nodeLayouts.size).toBe(2);
  });

  it("gives each edge opacity=1", () => {
    const layout = makeLayout(
      new Map([[1, makeNode(0, 0)], [2, makeNode(1, 0)]]),
      [{ parent: 1, child: 2 }],
    );
    expect(freeze(layout).edges[0].opacity).toBe(1);
  });

  it("carries floatingNode with opacity=1", () => {
    const layout = makeLayout(
      new Map([[1, makeNode(0, 0)]]),
      [],
      { value: 99, offset: -1.5, level: 0 },
    );
    const fn = freeze(layout).floatingNode!;
    expect(fn.value).toBe(99);
    expect(fn.opacity).toBe(1);
  });

  it("sets floatingNode to undefined when absent", () => {
    const layout = makeLayout(new Map([[1, makeNode(0, 0)]]));
    expect(freeze(layout).floatingNode).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// interpolate
// ---------------------------------------------------------------------------

describe("interpolate — node position", () => {
  it("at t=0 returns the from position", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0)]]));
    const to   = makeLayout(new Map([[1, makeNode(4, 6)]]));
    const node = interpolate(from, to, 0).nodeLayouts.get(1)!;
    expect(node.offset).toBe(0);
    expect(node.level).toBe(0);
  });

  it("at t=1 returns the to position", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0)]]));
    const to   = makeLayout(new Map([[1, makeNode(4, 6)]]));
    const node = interpolate(from, to, 1).nodeLayouts.get(1)!;
    expect(node.offset).toBe(4);
    expect(node.level).toBe(6);
  });

  it("at t=0.5 returns the midpoint", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0)]]));
    const to   = makeLayout(new Map([[1, makeNode(4, 6)]]));
    const node = interpolate(from, to, 0.5).nodeLayouts.get(1)!;
    expect(node.offset).toBe(2);
    expect(node.level).toBe(3);
  });
});

describe("interpolate — disappearing nodes", () => {
  it("fades out a node not in the to layout", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0)]]));
    const to   = makeLayout(new Map([]));
    const node = interpolate(from, to, 0.5).nodeLayouts.get(1)!;
    expect(node.opacity).toBeCloseTo(0.5);
  });

  it("fully opaque at t=0", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0)]]));
    const to   = makeLayout(new Map([]));
    expect(interpolate(from, to, 0).nodeLayouts.get(1)!.opacity).toBe(1);
  });

  it("fully transparent at t=1", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0)]]));
    const to   = makeLayout(new Map([]));
    expect(interpolate(from, to, 1).nodeLayouts.get(1)!.opacity).toBe(0);
  });
});

describe("interpolate — appearing nodes", () => {
  it("fades in and scales up a node not in the from layout", () => {
    const from = makeLayout(new Map([]));
    const to   = makeLayout(new Map([[1, makeNode(2, 0)]]));
    const node = interpolate(from, to, 0.5).nodeLayouts.get(1)!;
    expect(node.opacity).toBeCloseTo(0.5);
    expect(node.scale).toBeCloseTo(0.5);
  });
});

describe("interpolate — colorT interpolation", () => {
  it("interpolates from black to red", () => {
    const from = makeLayout(new Map([[1, makeNode(0, 0, false)]]));
    const to   = makeLayout(new Map([[1, makeNode(0, 0, true)]]));
    expect(interpolate(from, to, 0.5).nodeLayouts.get(1)!.colorT).toBeCloseTo(0.5);
  });
});

describe("interpolate — edges", () => {
  it("keeps an edge that exists in both with opacity=1", () => {
    const edge = { parent: 1, child: 2 };
    const nodes = new Map([[1, makeNode(0, 0)], [2, makeNode(1, 0)]]);
    const from = makeLayout(nodes, [edge]);
    const to   = makeLayout(nodes, [edge]);
    const result = interpolate(from, to, 0.5);
    expect(result.edges[0].opacity).toBe(1);
  });

  it("fades out an edge removed in to", () => {
    const nodes = new Map([[1, makeNode(0, 0)], [2, makeNode(1, 0)]]);
    const from = makeLayout(nodes, [{ parent: 1, child: 2 }]);
    const to   = makeLayout(nodes, []);
    const result = interpolate(from, to, 0.5);
    const edge = result.edges.find(e => e.parent === 1 && e.child === 2)!;
    expect(edge.opacity).toBeCloseTo(0.5);
  });

  it("fades in a new edge added in to", () => {
    const nodes = new Map([[1, makeNode(0, 0)], [2, makeNode(1, 0)]]);
    const from = makeLayout(nodes, []);
    const to   = makeLayout(nodes, [{ parent: 1, child: 2 }]);
    const result = interpolate(from, to, 0.5);
    const edge = result.edges.find(e => e.parent === 1 && e.child === 2)!;
    expect(edge.opacity).toBeCloseTo(0.5);
  });
});

describe("interpolate — description", () => {
  it("uses the to layout description", () => {
    const from = makeLayout(new Map(), [], undefined, "from desc");
    const to   = makeLayout(new Map(), [], undefined, "to desc");
    expect(interpolate(from, to, 0.5).description).toBe("to desc");
  });
});
