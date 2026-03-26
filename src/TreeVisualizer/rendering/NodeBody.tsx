import { useColors } from "../theme/ColorsContext";
import { NODE_RADIUS } from "../constants";
import { lerp, lerpColor } from "./math";

const RING_GAP = 0.1; // how far the highlight ring extends beyond NODE_RADIUS
const RING_STROKE = 0.06; // stroke width of the highlight ring
const NODE_STROKE = 0.025; // stroke width of the main node circle
const FONT_SIZE = 0.35; // node label font size (grid units)
const SPECULAR_STOP_LO = 55; // gradient mid-stop % at normal state
const SPECULAR_STOP_HI = 45; // gradient mid-stop % at full highlight (tighter specular)

export function NodeBody({
  value,
  colorT,
  highlightT,
  nodeId = String(value),
}: {
  value: number;
  colorT: number;
  highlightT: number;
  nodeId?: string;
}) {
  const colors = useColors();
  // Gradient stops: interpolate black↔red (colorT) and normal↔highlight (highlightT)
  const specularBlack = lerpColor(
    colors.nodeBlackHighlight,
    colors.nodeBlackHighlightSpecular,
    highlightT,
  );
  const specularRed = lerpColor(
    colors.nodeRedHighlight,
    colors.nodeRedHighlightSpecular,
    highlightT,
  );
  const stop0 = lerpColor(specularBlack, specularRed, colorT);
  const stop1 = lerpColor(colors.nodeBlack, colors.nodeRed, colorT);
  const stop2 = lerpColor(colors.nodeBlackDark, colors.nodeRedDark, colorT);
  // Highlight tightens the specular stop from SPECULAR_STOP_LO → SPECULAR_STOP_HI
  const stop1Pct = `${Math.round(lerp(SPECULAR_STOP_LO, SPECULAR_STOP_HI, highlightT))}%`;

  const strokeColor = lerpColor(
    colors.nodeBlackDark,
    colors.nodeRedDark,
    colorT,
  );
  const ringColor = lerpColor(colors.nodeBlackRing, colors.nodeRedRing, colorT);

  // Shadow smoothly transitions: dark offset drop-shadow (black) → centered red glow (red)
  const filterColor = lerpColor("#000000", colors.nodeRedGlow, colorT);
  const filterOpacity = lerp(0.44, 0.75, colorT);
  const filterDy = lerp(0.05, 0, colorT);
  const filterStd = lerp(0.0625, 0.1, colorT);

  const gradId = `ng-${nodeId}`;
  const filterId = `nf-${nodeId}`;

  return (
    <>
      {highlightT > 0 && (
        <circle
          cx={0}
          cy={0}
          r={NODE_RADIUS + RING_GAP}
          fill="none"
          stroke={ringColor}
          strokeWidth={RING_STROKE}
          opacity={highlightT}
          filter="url(#nodeHighlightRing)"
        />
      )}
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={stop0} />
          <stop offset={stop1Pct} stopColor={stop1} />
          <stop offset="100%" stopColor={stop2} />
        </radialGradient>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx={0}
            dy={filterDy}
            stdDeviation={filterStd}
            floodColor={filterColor}
            floodOpacity={filterOpacity}
          />
        </filter>
      </defs>
      <circle
        cx={0}
        cy={0}
        r={NODE_RADIUS}
        fill={`url(#${gradId})`}
        stroke={strokeColor}
        strokeWidth={NODE_STROKE}
        filter={`url(#${filterId})`}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dy="0.35em"
        fill={colors.nodeText}
        fontSize={FONT_SIZE}
        fontWeight="800"
        fontStyle="normal"
        letterSpacing={0}
      >
        {value}
      </text>
    </>
  );
}
