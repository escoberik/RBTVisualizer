import { colors } from "../colors";
import { LEVEL_GAP, NODE_RADIUS } from "../constants";

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
