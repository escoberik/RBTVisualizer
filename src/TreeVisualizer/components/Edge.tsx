import { colors } from "../colors";
import { NODE_RADIUS } from "../constants";

export function Edge({ dx, dy }: { dx: number; dy: number }) {
  const len = Math.sqrt(dx * dx + dy * dy);
  const scale = (len - NODE_RADIUS) / len;

  return (
    <g className="edge-group" filter="url(#edgeShadow)">
      <line
        x1={0}
        y1={0}
        x2={dx * scale}
        y2={dy * scale}
        stroke={colors.edge}
        strokeWidth={0.1}
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
      <line
        x1={0}
        y1={0}
        x2={dx * scale}
        y2={dy * scale}
        stroke={colors.edgeHighlight}
        strokeWidth={0.03}
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </g>
  );
}
