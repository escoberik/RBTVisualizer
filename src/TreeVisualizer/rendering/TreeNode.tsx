import type { AnimatedNodeLayout } from "./useLayoutTransition";
import { NodeBody } from "./NodeBody";

export function TreeNode({
  value,
  layout: { offset, level, colorT, highlightT, opacity, scale },
}: {
  value: number;
  layout: AnimatedNodeLayout;
}) {
  const color = colorT >= 0.5 ? "red" : "black";
  const highlight = highlightT > 0.5 ? ", current" : "";

  return (
    <g
      transform={`translate(${offset}, ${level})`}
      opacity={opacity}
      role="img"
      aria-label={`${value} (${color}${highlight})`}
    >
      <g transform={`scale(${scale})`}>
        <NodeBody value={value} colorT={colorT} highlightT={highlightT} />
      </g>
    </g>
  );
}
