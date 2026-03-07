import RBTree from "./RBT/RBTree";
import RBTNode from "./RBT/RBTNode";
import { colors } from "./colors";

const NIL_RADIUS = 8;
const NODE_RADIUS = NIL_RADIUS * 3;
const H_GAP = 20;
const V_GAP = 50;
const PADDING = 30;

const COL_WIDTH = NODE_RADIUS * 2 + H_GAP;
const ROW_HEIGHT = NODE_RADIUS * 2 + V_GAP;
const NIL_V_OFFSET = NODE_RADIUS + NIL_RADIUS + 16;

interface PositionedNode {
  node: RBTNode;
  x: number;
  y: number;
}

interface NilPosition {
  x: number;
  y: number;
  px: number;
  py: number;
}

function buildLayout(root: RBTNode | null): {
  nodes: PositionedNode[];
  nils: NilPosition[];
} {
  const nodes: PositionedNode[] = [];
  const nils: NilPosition[] = [];
  let col = 0;

  function traverse(node: RBTNode | null, depth: number): number | null {
    if (!node) return null;

    const leftCol = traverse(node.left, depth + 1);

    const x = PADDING + NODE_RADIUS + col * COL_WIDTH;
    const y = PADDING + NODE_RADIUS + depth * ROW_HEIGHT;
    nodes.push({ node, x, y });

    if (!node.left)
      nils.push({ x: x - COL_WIDTH / 2, y: y + NIL_V_OFFSET, px: x, py: y });
    if (!node.right)
      nils.push({ x: x + COL_WIDTH / 2, y: y + NIL_V_OFFSET, px: x, py: y });

    col++;

    traverse(node.right, depth + 1);

    return leftCol;
  }

  traverse(root, 0);
  return { nodes, nils };
}

function NilNode({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={NIL_RADIUS} fill="#6b7280" />;
}

function Edge({
  x1, y1, x2, y2,
}: {
  x1: number; y1: number; x2: number; y2: number;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.edge} strokeWidth={2} />;
}

function TreeNode({ x, y, node }: { x: number; y: number; node: RBTNode }) {
  const fill = node.isRed() ? colors.nodeRed : colors.nodeBlack;
  return (
    <g>
      <circle cx={x} cy={y} r={NODE_RADIUS} fill={fill} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.nodeText}
        fontSize="14"
        fontWeight="800"
      >
        {node.value}
      </text>
    </g>
  );
}

export default function TreeRenderer({ tree }: { tree: RBTree }) {
  if (!tree.root) {
    const size = NIL_RADIUS * 2 + PADDING * 2;
    return (
      <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
        <NilNode x={PADDING + NIL_RADIUS} y={PADDING + NIL_RADIUS} />
      </svg>
    );
  }

  const { nodes, nils } = buildLayout(tree.root);
  const posMap = new Map<RBTNode, PositionedNode>(nodes.map((p) => [p.node, p]));

  const width = Math.max(...nodes.map((p) => p.x), ...nils.map((n) => n.x)) + NODE_RADIUS + PADDING;
  const height = Math.max(...nodes.map((p) => p.y), ...nils.map((n) => n.y)) + NODE_RADIUS + PADDING;

  const edges: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const { node, x, y } of nodes) {
    if (node.left) {
      const c = posMap.get(node.left)!;
      edges.push({ key: `${node.value}-l`, x1: x, y1: y, x2: c.x, y2: c.y });
    }
    if (node.right) {
      const c = posMap.get(node.right)!;
      edges.push({ key: `${node.value}-r`, x1: x, y1: y, x2: c.x, y2: c.y });
    }
  }

  return (
    <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }}>
      {edges.map(({ key, ...e }) => <Edge key={key} {...e} />)}
      {nils.map(({ x, y, px, py }) => (
        <Edge key={`nil-e-${x}-${y}`} x1={px} y1={py} x2={x} y2={y} />
      ))}
      {nils.map(({ x, y }) => (
        <NilNode key={`nil-${x}-${y}`} x={x} y={y} />
      ))}
      {nodes.map(({ node, x, y }) => (
        <TreeNode key={node.value} x={x} y={y} node={node} />
      ))}
    </svg>
  );
}
