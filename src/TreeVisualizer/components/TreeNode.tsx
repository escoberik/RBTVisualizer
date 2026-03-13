import type { NodeLayout } from "../Layout";
import { Edge } from "./Edge";
import { NodeBody } from "./NodeBody";

export function TreeNode({
  value,
  red,
  layout: { offset, level, leftDistance, rightDistance, highlight },
}: {
  value: number;
  red: boolean;
  layout: NodeLayout;
}) {
  return (
    <g transform={`translate(${offset}, ${level})`}>
      {/* !== undefined, not truthy check: distance=0 is a valid vertical edge */}
      {leftDistance !== undefined && <Edge distance={-leftDistance} />}
      {rightDistance !== undefined && <Edge distance={rightDistance} />}
      <NodeBody value={value} red={red} highlight={highlight} />
    </g>
  );
}
