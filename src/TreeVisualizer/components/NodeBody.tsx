import { useColors } from "../ColorsContext";
import { NODE_RADIUS } from "../constants";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r  = mix((ca >> 16) & 0xff, (cb >> 16) & 0xff);
  const g  = mix((ca >>  8) & 0xff, (cb >>  8) & 0xff);
  const bl = mix( ca        & 0xff,  cb        & 0xff);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

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
  const specularBlack = lerpColor(colors.nodeBlackHighlight, colors.nodeBlackHighlightSpecular, highlightT);
  const specularRed   = lerpColor(colors.nodeRedHighlight,   colors.nodeRedHighlightSpecular,   highlightT);
  const stop0    = lerpColor(specularBlack, specularRed, colorT);
  const stop1    = lerpColor(colors.nodeBlack, colors.nodeRed, colorT);
  const stop2    = lerpColor(colors.nodeBlackDark, colors.nodeRedDark, colorT);
  // Highlight tightens the specular stop from 55% → 45%
  const stop1Pct = `${Math.round(lerp(55, 45, highlightT))}%`;

  const strokeColor = lerpColor(colors.nodeBlackDark, colors.nodeRedDark, colorT);
  const ringColor   = lerpColor(colors.nodeBlackRing, colors.nodeRedRing, colorT);

  // Shadow smoothly transitions: dark offset drop-shadow (black) → centered red glow (red)
  const filterColor   = lerpColor("#000000", colors.nodeRedGlow, colorT);
  const filterOpacity = lerp(0.44, 0.75, colorT);
  const filterDy      = lerp(0.05, 0, colorT);
  const filterStd     = lerp(0.0625, 0.1, colorT);

  const gradId   = `ng-${nodeId}`;
  const filterId = `nf-${nodeId}`;

  return (
    <>
      {highlightT > 0 && (
        <circle
          cx={0} cy={0} r={NODE_RADIUS + 0.1}
          fill="none"
          stroke={ringColor}
          strokeWidth={0.06}
          opacity={highlightT}
          filter="url(#nodeHighlightRing)"
        />
      )}
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%"       stopColor={stop0} />
          <stop offset={stop1Pct} stopColor={stop1} />
          <stop offset="100%"     stopColor={stop2} />
        </radialGradient>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx={0} dy={filterDy}
            stdDeviation={filterStd}
            floodColor={filterColor}
            floodOpacity={filterOpacity}
          />
        </filter>
      </defs>
      <circle
        cx={0} cy={0} r={NODE_RADIUS}
        fill={`url(#${gradId})`}
        stroke={strokeColor}
        strokeWidth={0.025}
        filter={`url(#${filterId})`}
      />
      <text
        x={0} y={0}
        textAnchor="middle"
        dy="0.35em"
        fill={colors.nodeText}
        fontSize={0.35}
        fontWeight="800"
        letterSpacing={0}
      >
        {value}
      </text>
    </>
  );
}
