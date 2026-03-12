import type InternalNode from "../RBT/InternalNode";
import type { NodeLayout } from "./Layout";
import { colors } from "./colors";
import { LEVEL_GAP, NODE_RADIUS } from "./constants";

export function TreeNode({
  node,
  layout: { offset, level, leftDistance, rightDistance },
}: {
  node: InternalNode<number>;
  layout: NodeLayout;
}) {
  const { value } = node;
  return (
    <g transform={`translate(${offset}, ${level})`}>
      {leftDistance !== undefined && <Edge distance={-leftDistance} />}
      {rightDistance !== undefined && <Edge distance={rightDistance} />}
      <NodeBody value={value} red={node.isRed} />
    </g>
  );
}

export function Edge({ distance }: { distance: number }) {
  const x = distance;
  const y = LEVEL_GAP;
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return null;
  const scale = (len - NODE_RADIUS) / len;

  return (
    <g className="edge-group" filter="url(#edgeShadow)">
      <line
        x1={0}
        y1={0}
        x2={x * scale}
        y2={y * scale}
        stroke={colors.edge}
        strokeWidth={0.1}
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1={0}
        y1={0}
        x2={x * scale}
        y2={y * scale}
        stroke={colors.edgeHighlight}
        strokeWidth={0.03}
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </g>
  );
}

export function NodeBody({ value, red }: { value: number; red: boolean }) {
  return (
    <>
      <circle
        cx={0}
        cy={0}
        r={NODE_RADIUS}
        fill={red ? "url(#nodeRedGradient)" : "url(#nodeBlackGradient)"}
        stroke={red ? colors.nodeRedDark : colors.nodeBlackDark}
        strokeWidth={0.025}
        filter={red ? "url(#nodeRedGlow)" : "url(#nodeShadow)"}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.nodeText}
        fontSize={0.35}
        fontWeight="800"
      >
        {value}
      </text>
    </>
  );
}
