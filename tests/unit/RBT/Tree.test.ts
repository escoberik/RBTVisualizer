import { describe, it, expect } from "vitest";
import RBTree from "../../../src/RBT/Tree";
import InternalNode from "../../../src/RBT/InternalNode";
import type Node from "../../../src/RBT/Node";
import type { EventType } from "../../../src/RBT/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTree(...values: number[]): RBTree<number> {
  const tree = new RBTree<number>();
  for (const v of values) tree.insert(v);
  return tree;
}

function inorder(tree: RBTree<number>): number[] {
  const result: number[] = [];
  function walk(node: Node<number>) {
    if (node.isNil) return;
    const n = node as InternalNode<number>;
    walk(n.left);
    result.push(n.value);
    walk(n.right);
  }
  walk(tree.root);
  return result;
}

/**
 * Verifies all four testable RBT invariants:
 *   1. Root is black.
 *   2. Red nodes have only black children (no red-red edges).
 *   3. BST ordering holds at every node.
 *   4. Every root-to-NIL path has the same black-height.
 */
function validateRBTree(tree: RBTree<number>, label = ""): void {
  const tag = label ? `[${label}] ` : "";

  if (!tree.root.isNil) {
    expect(tree.root.isRed, `${tag}root must be black`).toBe(false);
  }

  function check(node: Node<number>): number {
    if (node.isNil) return 1; // NIL counts as one black node

    const n = node as InternalNode<number>;

    if (n.isRed) {
      expect(
        n.left.isBlack,
        `${tag}red node ${n.value} has a red left child`,
      ).toBe(true);
      expect(
        n.right.isBlack,
        `${tag}red node ${n.value} has a red right child`,
      ).toBe(true);
    }

    if (!n.left.isNil) {
      const lv = (n.left as InternalNode<number>).value;
      expect(lv < n.value, `${tag}BST: left child ${lv} >= parent ${n.value}`).toBe(true);
    }
    if (!n.right.isNil) {
      const rv = (n.right as InternalNode<number>).value;
      expect(rv > n.value, `${tag}BST: right child ${rv} <= parent ${n.value}`).toBe(true);
    }

    const leftBH = check(n.left);
    const rightBH = check(n.right);
    expect(
      leftBH,
      `${tag}black-height mismatch at node ${n.value} ` +
        `(left=${leftBH}, right=${rightBH})`,
    ).toBe(rightBH);

    return n.isBlack ? leftBH + 1 : leftBH;
  }

  check(tree.root);
}

// ---------------------------------------------------------------------------
// Empty tree
// ---------------------------------------------------------------------------

describe("RBTree — empty tree", () => {
  it("has a NIL root", () => {
    expect(new RBTree<number>().root.isNil).toBe(true);
  });

  it("find returns null", () => {
    expect(new RBTree<number>().find(1)).toBeNull();
  });

  it("delete returns false", () => {
    expect(new RBTree<number>().delete(1)).toBe(false);
  });

  it("satisfies RBT invariants", () => {
    validateRBTree(new RBTree<number>(), "empty");
  });
});

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

describe("RBTree — insert", () => {
  it("first insert creates a black root", () => {
    const tree = buildTree(10);
    expect(tree.root.isNil).toBe(false);
    expect(tree.root.isRed).toBe(false);
    expect((tree.root as InternalNode<number>).value).toBe(10);
  });

  it("returns the inserted node", () => {
    const node = new RBTree<number>().insert(42);
    expect(node.value).toBe(42);
  });

  it("duplicate insert returns the existing node without changing the tree", () => {
    const tree = buildTree(10, 5, 15);
    const before = inorder(tree);
    const node = tree.insert(10);
    expect(node.value).toBe(10);
    expect(inorder(tree)).toEqual(before);
  });

  // Each rotation case is deterministic: a fixed 3-node sequence forces a
  // specific fixup path, producing a known root value.
  it("LL rotation: [10, 5, 3] — root becomes 5", () => {
    const tree = buildTree(10, 5, 3);
    expect((tree.root as InternalNode<number>).value).toBe(5);
    validateRBTree(tree, "LL");
  });

  it("LR rotation: [10, 5, 7] — root becomes 7", () => {
    const tree = buildTree(10, 5, 7);
    expect((tree.root as InternalNode<number>).value).toBe(7);
    validateRBTree(tree, "LR");
  });

  it("RR rotation: [10, 15, 20] — root becomes 15", () => {
    const tree = buildTree(10, 15, 20);
    expect((tree.root as InternalNode<number>).value).toBe(15);
    validateRBTree(tree, "RR");
  });

  it("RL rotation: [10, 15, 12] — root becomes 12", () => {
    const tree = buildTree(10, 15, 12);
    expect((tree.root as InternalNode<number>).value).toBe(12);
    validateRBTree(tree, "RL");
  });

  it("uncle-red recolor: [10, 5, 15, 3] propagates recolor up correctly", () => {
    // Inserting 3: parent=5(R), uncle=15(R) → recolor both black, 10 red,
    // then repaint root black.
    const tree = buildTree(10, 5, 15, 3);
    validateRBTree(tree, "uncle-red");
  });

  it("in-order traversal is sorted after a mixed insertion sequence", () => {
    const values = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];
    expect(inorder(buildTree(...values))).toEqual(
      [...values].sort((a, b) => a - b),
    );
  });

  it("satisfies RBT invariants after each of 20 sequential inserts", () => {
    const tree = new RBTree<number>();
    const values = [
      15, 6, 23, 4, 13, 20, 42, 2, 5, 11, 14, 18, 22, 30, 50,
      1, 3, 7, 12, 35,
    ];
    for (const v of values) {
      tree.insert(v);
      validateRBTree(tree, `after insert ${v}`);
    }
  });

  it("satisfies RBT invariants with 50 nodes", () => {
    // Pseudo-random sequence chosen to exercise many recolor+rotation paths.
    const values = Array.from({ length: 50 }, (_, i) => (i * 37 + 7) % 99 + 1);
    const unique = [...new Set(values)];
    const tree = buildTree(...unique);
    validateRBTree(tree, "50-node");
    expect(inorder(tree)).toEqual([...unique].sort((a, b) => a - b));
  });
});

// ---------------------------------------------------------------------------
// Find
// ---------------------------------------------------------------------------

describe("RBTree — find", () => {
  it("returns null on an empty tree", () => {
    expect(new RBTree<number>().find(5)).toBeNull();
  });

  it("returns null when value is not in the tree", () => {
    expect(buildTree(10, 5, 15).find(99)).toBeNull();
  });

  it("returns the correct node when value exists", () => {
    const node = buildTree(10, 5, 15, 3, 7).find(7);
    expect(node).not.toBeNull();
    expect(node!.value).toBe(7);
  });

  it("does not mutate the tree", () => {
    const tree = buildTree(10, 5, 15);
    const before = inorder(tree);
    tree.find(5);
    tree.find(99);
    expect(inorder(tree)).toEqual(before);
    validateRBTree(tree, "after find");
  });
});

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

describe("RBTree — delete", () => {
  it("returns false on an empty tree", () => {
    expect(new RBTree<number>().delete(1)).toBe(false);
  });

  it("returns false when value is not in the tree", () => {
    expect(buildTree(10, 5, 15).delete(99)).toBe(false);
  });

  it("returns true when a value is successfully deleted", () => {
    expect(buildTree(10).delete(10)).toBe(true);
  });

  it("deletes the only node, leaving an empty tree", () => {
    const tree = buildTree(10);
    tree.delete(10);
    expect(tree.root.isNil).toBe(true);
  });

  it("deletes a red leaf", () => {
    // After [10, 5, 15], nodes 5 and 15 are red leaves.
    const tree = buildTree(10, 5, 15);
    tree.delete(5);
    expect(tree.find(5)).toBeNull();
    validateRBTree(tree, "delete red leaf");
  });

  it("deletes a black node, triggering fixDelete", () => {
    // [10, 5, 15, 3]: inserting 3 with red uncle recolors 5 and 15 to black,
    // leaving 3 as a red leaf and 5 as a black internal node.
    // Deleting 5 removes a black node and requires fixup.
    const tree = buildTree(10, 5, 15, 3);
    tree.delete(5);
    expect(tree.find(5)).toBeNull();
    validateRBTree(tree, "delete black node");
  });

  it("deletes a node with one child", () => {
    // After [10, 5, 15, 3], node 5 has one child (3).
    const tree = buildTree(10, 5, 15, 3);
    tree.delete(5);
    expect(tree.find(5)).toBeNull();
    expect(tree.find(3)).not.toBeNull();
    validateRBTree(tree, "delete one-child node");
  });

  it("deletes a node with two children via successor splice", () => {
    const tree = buildTree(10, 5, 15, 3, 7, 12, 20);
    tree.delete(15); // 15 has two children: 12 and 20
    expect(tree.find(15)).toBeNull();
    expect(tree.find(12)).not.toBeNull();
    expect(tree.find(20)).not.toBeNull();
    validateRBTree(tree, "delete two-children node");
  });

  it("deletes the root of a multi-node tree", () => {
    const tree = buildTree(10, 5, 15, 3, 7, 12, 20);
    tree.delete(10);
    expect(tree.find(10)).toBeNull();
    validateRBTree(tree, "delete root");
  });

  it("in-order traversal remains sorted after deletions", () => {
    const tree = buildTree(10, 5, 15, 3, 7, 12, 20);
    tree.delete(5);
    tree.delete(15);
    expect(inorder(tree)).toEqual([3, 7, 10, 12, 20]);
  });

  it("satisfies RBT invariants after each deletion in a 15-node tree", () => {
    const values = [10, 5, 20, 3, 7, 15, 30, 1, 4, 6, 8, 12, 18, 25, 35];
    const tree = buildTree(...values);
    // Delete in an order designed to exercise different fixup branches:
    // leaves, internal nodes, nodes with one child, nodes with two children.
    const deleteOrder = [1, 35, 3, 30, 6, 25, 7, 18, 4, 15, 5, 20, 8, 12, 10];
    for (const v of deleteOrder) {
      tree.delete(v);
      validateRBTree(tree, `after delete ${v}`);
    }
    expect(tree.root.isNil).toBe(true);
  });

  it("satisfies RBT invariants deleting all nodes in their insertion order", () => {
    const values = [50, 25, 75, 10, 30, 60, 80, 5, 15];
    const tree = buildTree(...values);
    for (const v of values) {
      tree.delete(v);
      validateRBTree(tree, `after delete ${v} (insertion order)`);
    }
  });

  it("satisfies RBT invariants with 50 nodes after deleting half", () => {
    const values = Array.from({ length: 50 }, (_, i) => (i * 37 + 7) % 99 + 1);
    const unique = [...new Set(values)];
    const tree = buildTree(...unique);
    // Delete every other value from the sorted list.
    const sorted = [...unique].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i += 2) tree.delete(sorted[i]);
    validateRBTree(tree, "50-node after half deleted");
  });
});

// ---------------------------------------------------------------------------
// Event log
// ---------------------------------------------------------------------------

describe("RBTree — event log", () => {
  function loggedTree(): { tree: RBTree<number>; events: EventType[] } {
    const events: EventType[] = [];
    const tree = new RBTree<number>((e) => events.push(e));
    return { tree, events };
  }

  it("fires INSERT when a new node is added", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    expect(events).toContain("INSERT");
  });

  it("fires RECOLOR_ROOT when the first node is painted black", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    expect(events).toContain("RECOLOR_ROOT");
  });

  it("fires FOUND when find locates an existing value", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    events.length = 0;
    tree.find(10);
    expect(events).toContain("FOUND");
  });

  it("fires NOT_FOUND when find misses", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    events.length = 0;
    tree.find(99);
    expect(events).toContain("NOT_FOUND");
  });

  it("fires COMPARE_LEFT when traversing left", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    events.length = 0;
    tree.find(5); // 5 < 10 → go left
    expect(events).toContain("COMPARE_LEFT");
  });

  it("fires COMPARE_RIGHT when traversing right", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    events.length = 0;
    tree.find(15); // 15 > 10 → go right
    expect(events).toContain("COMPARE_RIGHT");
  });

  it("fires ROTATE_LEFT during an RR insertion", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    tree.insert(15);
    events.length = 0;
    tree.insert(20); // right-right path → left rotation
    expect(events).toContain("ROTATE_LEFT");
  });

  it("fires ROTATE_RIGHT during an LL insertion", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    tree.insert(5);
    events.length = 0;
    tree.insert(3); // left-left path → right rotation
    expect(events).toContain("ROTATE_RIGHT");
  });

  it("fires DELETE when a node is removed", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    events.length = 0;
    tree.delete(10);
    expect(events).toContain("DELETE");
  });

  it("fires no INSERT or fixup events when inserting a duplicate", () => {
    const { tree, events } = loggedTree();
    tree.insert(10);
    events.length = 0;
    tree.insert(10); // duplicate: findPosition logs FOUND, then returns early
    expect(events).toContain("FOUND");
    expect(events).not.toContain("INSERT");
    expect(events).not.toContain("ROTATE_LEFT");
    expect(events).not.toContain("ROTATE_RIGHT");
  });
});
