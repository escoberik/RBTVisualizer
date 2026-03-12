import { colors } from "../colors";
import { NODE_RADIUS } from "../constants";

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
