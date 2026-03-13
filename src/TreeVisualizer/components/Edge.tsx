import { colors } from "../colors";
import { NODE_RADIUS } from "../constants";

const ARROW_LEN = 0.25;
const ARROW_WING = 0.225;

export function Edge({ dx, dy }: { dx: number; dy: number }) {
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular unit vector
  const px = -uy;
  const py = ux;

  // Line stops at arrowhead base; tip sits at child node boundary
  const lineScale = (len - NODE_RADIUS - ARROW_LEN) / len;
  const edgeScale = (len - NODE_RADIUS) / len;

  const ex = dx * edgeScale;
  const ey = dy * edgeScale;
  // Arrow base (ARROW_LEN behind tip)
  const bx = ex - ARROW_LEN * ux;
  const by = ey - ARROW_LEN * uy;
  // Hollow notch (0.175 behind tip)
  const ix = ex - 0.175 * ux;
  const iy = ey - 0.175 * uy;
  const l = `${bx + ARROW_WING * px},${by + ARROW_WING * py}`;
  const r = `${bx - ARROW_WING * px},${by - ARROW_WING * py}`;

  return (
    <g className="edge-group">
      <line
        x1={0} y1={0}
        x2={dx * lineScale} y2={dy * lineScale}
        stroke={colors.edge}
        strokeWidth={0.1}
        strokeLinecap="round"
      />
      <line
        x1={0} y1={0}
        x2={dx * lineScale} y2={dy * lineScale}
        stroke={colors.edgeHighlight}
        strokeWidth={0.03}
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <polygon
        points={`${l} ${ex},${ey} ${r} ${ix},${iy}`}
        fill={colors.edge}
        stroke={colors.edgeHighlight}
        strokeWidth={0.02}
        strokeOpacity={0.6}
        strokeLinejoin="round"
      />
    </g>
  );
}
