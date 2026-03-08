import type RBTNode from "../RBT/RBTNode";

export const NIL_RADIUS = 8;
export const NODE_RADIUS = NIL_RADIUS * 3;
const PADDING = 30;

const H_GAP = 20;
const V_GAP = 50;

const COL_WIDTH = NODE_RADIUS * 2 + H_GAP;
export const ROW_HEIGHT = NODE_RADIUS * 2 + V_GAP;
const NIL_V_OFFSET = 2 * NODE_RADIUS + NIL_RADIUS;
const MARGIN = NODE_RADIUS + PADDING;

export interface ChildPos {
  x: number;
  y: number;
  isNil: boolean;
}

export interface LeafNodeProperties {
  node: RBTNode;
  x: number;
  y: number;
  left: ChildPos;
  right: ChildPos;
}

export class Layout {
  readonly nodes: (LeafNodeProperties & { key: string })[];

  private constructor(nodes: (LeafNodeProperties & { key: string })[]) {
    this.nodes = nodes;
  }

  static from(root: RBTNode | null): Layout {
    const raw: { node: RBTNode; x: number; y: number; index: number }[] = [];

    function traverse(node: RBTNode | null, depth: number) {
      if (!node) return;
      traverse(node.left, depth + 1);
      const index = raw.length;
      raw.push({ node, x: index * COL_WIDTH, y: depth * ROW_HEIGHT, index });
      traverse(node.right, depth + 1);
    }

    traverse(root, 0);

    if (raw.length === 0) return new Layout([]);

    // Shift x so the root sits at x=0
    const rootX = raw.find((p) => p.node === root)!.x;
    for (const p of raw) p.x -= rootX;

    const posMap = new Map(raw.map((p) => [p.node, p]));

    const nodes = raw.map(({ node, x, y, index }) => ({
      node,
      x,
      y,
      key: `node-${index}`,
      left: node.left
        ? {
            x: posMap.get(node.left)!.x,
            y: posMap.get(node.left)!.y,
            isNil: false,
          }
        : { x: x - COL_WIDTH / 2, y: y + NIL_V_OFFSET, isNil: true },
      right: node.right
        ? {
            x: posMap.get(node.right)!.x,
            y: posMap.get(node.right)!.y,
            isNil: false,
          }
        : { x: x + COL_WIDTH / 2, y: y + NIL_V_OFFSET, isNil: true },
    }));

    return new Layout(nodes);
  }

  /**
   * Returns the tip of an edge from `parentValue`'s node toward its left/right
   * child, shortened to stop at the child's circumference — matching exactly
   * the endpoint drawn by the Edge component.
   */
  arrowEndpoint(
    parentValue: number,
    side: "left" | "right",
  ): { x: number; y: number } | null {
    const parent = this.nodes.find((n) => n.node.value === parentValue);
    if (!parent) return null;
    const child = side === "left" ? parent.left : parent.right;
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const childRadius = child.isNil ? NIL_RADIUS : NODE_RADIUS;
    const scale = len > 0 ? (len - childRadius) / len : 0;
    return { x: dx * scale, y: dy * scale };
  }

  get bounds(): { x: number; y: number; width: number; height: number } {
    const topPad = ROW_HEIGHT + MARGIN;

    if (this.nodes.length === 0) {
      const botPad = NIL_V_OFFSET + MARGIN;
      return {
        x: -(COL_WIDTH / 2 + MARGIN),
        y: -topPad,
        width: COL_WIDTH + 2 * MARGIN,
        height: topPad + botPad,
      };
    }

    let minX = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const { x, y, left, right } of this.nodes) {
      minX = Math.min(minX, x, left.x, right.x);
      maxX = Math.max(maxX, x, left.x, right.x);
      maxY = Math.max(maxY, y, left.y, right.y);
    }

    return {
      x: minX - MARGIN,
      y: -topPad,
      width: maxX - minX + 2 * MARGIN,
      height: topPad + maxY + MARGIN,
    };
  }
}
