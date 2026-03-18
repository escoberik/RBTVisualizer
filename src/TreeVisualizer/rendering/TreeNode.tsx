import type { AnimatedNodeLayout } from "./useLayoutTransition";
import { NodeBody } from "./NodeBody";

export function TreeNode({
  value,
  layout: { offset, level, colorT, highlightT, opacity, scale },
}: {
  value: number;
  layout: AnimatedNodeLayout;
}) {
  return (
    <g transform={`translate(${offset}, ${level})`} opacity={opacity}>
      <g transform={`scale(${scale})`}>
        <NodeBody value={value} colorT={colorT} highlightT={highlightT} />
      </g>
    </g>
  );
}
