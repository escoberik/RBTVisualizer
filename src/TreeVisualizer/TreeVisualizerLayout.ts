import RBTNode from "../RBT/RBTNode";
import { NIL_RADIUS, NODE_RADIUS, PADDING, LeafNodeProperties } from "./TreeVisualizerComponents";

const H_GAP = 20;
const V_GAP = 50;

const COL_WIDTH = NODE_RADIUS * 2 + H_GAP;
const ROW_HEIGHT = NODE_RADIUS * 2 + V_GAP;
const NIL_V_OFFSET = NODE_RADIUS + NIL_RADIUS + 24;
const MARGIN = NODE_RADIUS + PADDING;

export class Layout {
  readonly nodes: (LeafNodeProperties & { key: string })[];

  private constructor(nodes: (LeafNodeProperties & { key: string })[]) {
    this.nodes = nodes;
  }

  static from(root: RBTNode | null): Layout {
    const raw: { node: RBTNode; x: number; y: number; index: number }[] = [];
    let index = 0;

    function traverse(node: RBTNode | null, depth: number) {
      if (!node) return;
      traverse(node.left, depth + 1);
      raw.push({ node, x: index * COL_WIDTH, y: depth * ROW_HEIGHT, index });
      index++;
      traverse(node.right, depth + 1);
    }

    traverse(root, 0);

    if (raw.length === 0) return new Layout([]);

    // Shift x so the root sits at x=0
    const rootX = raw.find(p => p.node === root)!.x;
    for (const p of raw) p.x -= rootX;

    const posMap = new Map(raw.map((p) => [p.node, p]));

    const nodes = raw.map(({ node, x, y, index }) => ({
      node, x, y,
      key: `node-${index}`,
      left: node.left
        ? { x: posMap.get(node.left)!.x, y: posMap.get(node.left)!.y, isNil: false }
        : { x: x - COL_WIDTH / 2, y: y + NIL_V_OFFSET, isNil: true },
      right: node.right
        ? { x: posMap.get(node.right)!.x, y: posMap.get(node.right)!.y, isNil: false }
        : { x: x + COL_WIDTH / 2, y: y + NIL_V_OFFSET, isNil: true },
    }));

    return new Layout(nodes);
  }

  get size(): { x: number; y: number; width: number; height: number } {
    if (this.nodes.length === 0) {
      return {
        x: -(NIL_RADIUS + PADDING),
        y: -(NIL_RADIUS + PADDING),
        width:  (NIL_RADIUS + PADDING) * 2,
        height: (NIL_RADIUS + PADDING) * 2,
      };
    }

    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const { x, y, left, right } of this.nodes) {
      minX = Math.min(minX, x, left.x, right.x);
      maxX = Math.max(maxX, x, left.x, right.x);
      maxY = Math.max(maxY, y, left.y, right.y);
    }

    return {
      x: minX - MARGIN,
      y: -MARGIN,
      width:  maxX - minX + 2 * MARGIN,
      height: maxY    + 2 * MARGIN,
    };
  }
}
