import RBTree from "./RBT/RBTree";

const NIL_RADIUS = 8;
const NODE_RADIUS = NIL_RADIUS * 3;
const PADDING = 25;

function NilNode({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={NIL_RADIUS} fill="#6b7280" />;
}

function TreeNode({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={NODE_RADIUS} fill="#ef4444" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    </g>
  );
}

export default function TreeRenderer({ tree }: { tree: RBTree }) {
  const contentWidth = NIL_RADIUS * 2;
  const contentHeight = NIL_RADIUS * 2;
  const width = contentWidth + PADDING * 2;
  const height = contentHeight + PADDING * 2;
  const cx = PADDING + NIL_RADIUS;
  const cy = PADDING + NIL_RADIUS;

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "block", margin: "0 auto" }}
    >
      {tree.root ? (
        <TreeNode x={cx} y={cy} value={tree.root.value} />
      ) : (
        <NilNode x={cx} y={cy} />
      )}
    </svg>
  );
}
