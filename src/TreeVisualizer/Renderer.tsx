import InternalNode from "../RBT/InternalNode";
import type Node from "../RBT/Node";
import type Layout from "../RBT/Layout";
import SvgDefs from "./SvgDefs";
import { Edge, NodeBody } from "./Components";
import { NODE_RADIUS, ROW_HEIGHT, H_SLOT, PADDING } from "./constants";

type RenderNode = {
  value: number;
  isRed: boolean;
  x: number;
  y: number;
  edges: { x: number; y: number }[];
};

function collectNodes(node: Node<number>, layout: Layout<number>): RenderNode[] {
  if (node.isNil) return [];

  const pos = layout.getNodePosition(node)!;
  const x = pos.offset * H_SLOT;
  const y = pos.level * ROW_HEIGHT;

  const edges: { x: number; y: number }[] = [];
  for (const child of [node.left, node.right]) {
    if (!child.isNil) {
      const cp = layout.getNodePosition(child)!;
      edges.push({ x: cp.offset * H_SLOT - x, y: cp.level * ROW_HEIGHT - y });
    }
  }

  return [
    {
      value: (node as InternalNode<number>).value,
      isRed: node.isRed,
      x,
      y,
      edges,
    },
    ...collectNodes(node.left, layout),
    ...collectNodes(node.right, layout),
  ];
}

export default function Renderer({
  root,
  layout,
}: {
  root: Node<number>;
  layout: Layout<number>;
}) {
  if (root.isNil) return null;

  const nodes = collectNodes(root, layout);
  const vbWidth = layout.size.width * H_SLOT + 2 * PADDING;
  const vbHeight = (layout.size.height - 1) * ROW_HEIGHT + 2 * PADDING;

  return (
    <svg
      viewBox={`${-PADDING} ${-PADDING} ${vbWidth} ${vbHeight}`}
      width={vbWidth}
      className="tree-svg"
    >
      <SvgDefs />
      {nodes.map(({ value, x, y, edges }) => (
        <g key={value} transform={`translate(${x}, ${y})`}>
          {edges.map((e, i) => (
            <Edge key={i} x={e.x} y={e.y} childRadius={NODE_RADIUS} />
          ))}
        </g>
      ))}
      {nodes.map(({ value, x, y, isRed }) => (
        <g key={value} transform={`translate(${x}, ${y})`}>
          <NodeBody node={{ value, red: isRed }} />
        </g>
      ))}
    </svg>
  );
}
