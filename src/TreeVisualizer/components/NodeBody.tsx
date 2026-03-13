import { colors } from "../colors";
import { NODE_RADIUS } from "../constants";

export function NodeBody({
  value,
  red,
  highlight,
}: {
  value: number;
  red: boolean;
  highlight: boolean;
}) {
  return (
    <>
      {highlight && (
        <circle
          cx={0}
          cy={0}
          r={NODE_RADIUS + 0.1}
          fill="none"
          stroke={red ? colors.nodeRedRing : colors.nodeBlackRing}
          strokeWidth={0.06}
          filter="url(#nodeHighlightRing)"
        />
      )}
      <circle
        cx={0}
        cy={0}
        r={NODE_RADIUS}
        fill={
          highlight
            ? red ? "url(#nodeRedHighlightGradient)" : "url(#nodeBlackHighlightGradient)"
            : red ? "url(#nodeRedGradient)"           : "url(#nodeBlackGradient)"
        }
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
