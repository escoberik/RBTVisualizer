import { colors } from "./colors";
import { NIL_RADIUS, NODE_RADIUS } from "./Layout";
import type { LeafNodeProperties } from "./Layout";
import type { OperationNode } from "./Snapshot";

export function NilNode({ x, y }: { x: number; y: number }) {
  return (
    <g className="nil-node-group" transform={`translate(${x}, ${y})`}>
      <circle
        cx={0}
        cy={0}
        r={NIL_RADIUS}
        fill="url(#nilGradient)"
        stroke={colors.edge}
        strokeWidth="0.8"
        filter="url(#nilShadow)"
      />
    </g>
  );
}

function Edge({
  x,
  y,
  childRadius,
}: {
  x: number;
  y: number;
  childRadius: number;
}) {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return null;
  const scale = (len - childRadius) / len;
  const ex = x * scale;
  const ey = y * scale;
  return (
    <g className="edge-group" filter="url(#edgeShadow)">
      <line
        x1={0}
        y1={0}
        x2={ex}
        y2={ey}
        stroke={colors.edge}
        strokeWidth={4}
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1={0}
        y1={0}
        x2={ex}
        y2={ey}
        stroke={colors.edgeHighlight}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </g>
  );
}

function NodeBody({ node }: { node: OperationNode }) {
  const isRed = node.red;
  return (
    <>
      <circle
        cx={0}
        cy={0}
        r={NODE_RADIUS}
        fill={isRed ? "url(#nodeRedGradient)" : "url(#nodeBlackGradient)"}
        stroke={isRed ? colors.nodeRedDark : colors.nodeBlackDark}
        strokeWidth="1"
        filter={isRed ? "url(#nodeRedGlow)" : "url(#nodeShadow)"}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.nodeText}
        fontSize="14"
        fontWeight="800"
      >
        {node.value}
      </text>
    </>
  );
}

type StandaloneNodeProps = {
  x: number;
  y: number;
  node: OperationNode;
  className?: string;
};

export function StandaloneNode({ x, y, node, className }: StandaloneNodeProps) {
  return (
    <g transform={`translate(${x}, ${y})`} className={className}>
      <NodeBody node={node} />
    </g>
  );
}

export function LeafNode({
  x,
  y,
  node,
  left,
  right,
  className,
}: LeafNodeProperties & { className?: string }) {
  const lx = left.x - x,
    ly = left.y - y;
  const rx = right.x - x,
    ry = right.y - y;
  return (
    <g transform={`translate(${x}, ${y})`} className={className}>
      <Edge x={lx} y={ly} childRadius={left.isNil ? NIL_RADIUS : NODE_RADIUS} />
      {left.isNil && <NilNode x={lx} y={ly} />}
      <Edge
        x={rx}
        y={ry}
        childRadius={right.isNil ? NIL_RADIUS : NODE_RADIUS}
      />
      {right.isNil && <NilNode x={rx} y={ry} />}
      <NodeBody node={node} />
    </g>
  );
}
