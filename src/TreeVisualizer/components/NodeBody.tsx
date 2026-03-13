import { colors } from "../colors";
import { NODE_RADIUS } from "../constants";

function lerpColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = mix((ca >> 16) & 0xff, (cb >> 16) & 0xff);
  const g = mix((ca >>  8) & 0xff, (cb >>  8) & 0xff);
  const bl = mix( ca       & 0xff,  cb       & 0xff);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

export function NodeBody({
  value,
  colorT,
  highlightT,
}: {
  value: number;
  colorT: number;
  highlightT: number;
}) {
  const blackFill = highlightT >= 0.5 ? "url(#nodeBlackHighlightGradient)" : "url(#nodeBlackGradient)";
  const redFill   = highlightT >= 0.5 ? "url(#nodeRedHighlightGradient)"   : "url(#nodeRedGradient)";
  const ringColor = lerpColor(colors.nodeBlackRing, colors.nodeRedRing, colorT);

  return (
    <>
      {/* Highlight ring — fades in/out smoothly */}
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
      {/* Black layer — fades out as colorT increases */}
      {colorT < 1 && (
        <circle
          cx={0} cy={0} r={NODE_RADIUS}
          fill={blackFill}
          stroke={colors.nodeBlackDark}
          strokeWidth={0.025}
          filter="url(#nodeShadow)"
          opacity={1 - colorT}
        />
      )}
      {/* Red layer — fades in as colorT increases */}
      {colorT > 0 && (
        <circle
          cx={0} cy={0} r={NODE_RADIUS}
          fill={redFill}
          stroke={colors.nodeRedDark}
          strokeWidth={0.025}
          filter="url(#nodeRedGlow)"
          opacity={colorT}
        />
      )}
      <text
        x={0} y={0}
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
