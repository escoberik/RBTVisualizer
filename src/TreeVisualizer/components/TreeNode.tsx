import type InternalNode from "../../RBT/InternalNode";
import type { NodeLayout } from "../Layout";
import { Edge } from "./Edge";
import { NodeBody } from "./NodeBody";

export function TreeNode({
  node,
  layout: { offset, level, leftDistance, rightDistance },
}: {
  node: InternalNode<number>;
  layout: NodeLayout;
}) {
  const { value } = node;
  return (
    <g transform={`translate(${offset}, ${level})`}>
      {leftDistance !== undefined && <Edge distance={-leftDistance} />}
      {rightDistance !== undefined && <Edge distance={rightDistance} />}
      <NodeBody value={value} red={node.isRed} />
    </g>
  );
}
