import RBTree from "../RBT/RBTree";
import RBTNode from "../RBT/RBTNode";
import SvgDefs from "./TreeVisualizerSvgDefs";
import {
  NIL_RADIUS,
  NODE_RADIUS,
  PADDING,
  LeafNodeProperties,
  LeafNode,
  EmptyTree,
} from "./TreeVisualizerComponents";

const H_GAP = 20;
const V_GAP = 50;

const COL_WIDTH = NODE_RADIUS * 2 + H_GAP;
const ROW_HEIGHT = NODE_RADIUS * 2 + V_GAP;
const NIL_V_OFFSET = NODE_RADIUS + NIL_RADIUS + 24;

class Layout {
  readonly nodes: (LeafNodeProperties & { key: string })[];

  private constructor(nodes: (LeafNodeProperties & { key: string })[]) {
    this.nodes = nodes;
  }

  static from(root: RBTNode): Layout {
    const raw: { node: RBTNode; x: number; y: number; index: number }[] = [];
    let index = 0;

    function traverse(node: RBTNode | null, depth: number) {
      if (!node) return;
      traverse(node.left, depth + 1);
      raw.push({
        node,
        x: PADDING + NODE_RADIUS + index * COL_WIDTH,
        y: PADDING + NODE_RADIUS + depth * ROW_HEIGHT,
        index,
      });
      index++;
      traverse(node.right, depth + 1);
    }

    traverse(root, 0);

    const posMap = new Map(raw.map((p) => [p.node, p]));

    const nodes = raw.map(({ node, x, y, index }) => ({
      node,
      x,
      y,
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

  get size(): { width: number; height: number } {
    let maxX = 0, maxY = 0;
    for (const { x, y, left, right } of this.nodes) {
      maxX = Math.max(maxX, x, left.x, right.x);
      maxY = Math.max(maxY, y, left.y, right.y);
    }
    return { width: maxX + NODE_RADIUS + PADDING, height: maxY + NODE_RADIUS + PADDING };
  }
}

export default function TreeRenderer({ tree }: { tree: RBTree }) {
  if (tree.isEmpty()) return <EmptyTree />;

  const layout = Layout.from(tree.root!);
  const { width, height } = layout.size;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} className="tree-svg">
      <SvgDefs />
      {layout.nodes.map(({ key, ...props }) => (
        <LeafNode key={key} {...props} />
      ))}
    </svg>
  );
}
