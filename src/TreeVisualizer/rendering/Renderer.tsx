import type { AnimatedLayout } from "./useLayoutTransition";
import SvgDefs from "./SvgDefs";
import { TreeNode } from "./TreeNode";
import { Edge } from "./Edge";
import { NodeBody } from "./NodeBody";
import { SLOT, PADDING } from "../constants";

export default function Renderer({
  layout,
  viewport,
}: {
  layout: AnimatedLayout<number>;
  viewport: { width: number; height: number };
}) {
  const halfWidth = viewport.width / 2;
  const vbWidth = viewport.width + 2 * PADDING;
  // viewport.height is a slot count, so the visual span is height-1 (first to last slot).
  // halfWidth centers the root (offset=0) in the middle of the stable viewport.
  const vbHeight = viewport.height - 1 + 2 * PADDING + 0.5;

  return (
    <svg
      viewBox={`${-halfWidth - PADDING} ${-PADDING - 0.5} ${vbWidth} ${vbHeight}`}
      width={vbWidth * SLOT}
      className="tree-svg"
    >
      <SvgDefs />
      {layout.edges.map((edge) => {
        const parent = layout.nodeLayouts.get(edge.parent);
        const child = layout.nodeLayouts.get(edge.child);
        if (!parent || !child) return null;
        const dx = child.offset - parent.offset;
        const dy = child.level - parent.level;
        return (
          <g
            key={`${edge.parent}:${edge.child}`}
            transform={`translate(${parent.offset}, ${parent.level})`}
            opacity={edge.opacity}
          >
            <Edge dx={dx} dy={dy} />
          </g>
        );
      })}
      {[...layout.nodeLayouts.entries()].map(([value, nodeLayout]) => (
        <TreeNode key={value} value={value} layout={nodeLayout} />
      ))}
      {layout.floatingNode && (
        <g
          transform={`translate(${layout.floatingNode.offset}, ${layout.floatingNode.level})`}
          opacity={layout.floatingNode.opacity}
        >
          <NodeBody
            value={layout.floatingNode.value}
            colorT={1}
            highlightT={1}
            nodeId="float"
          />
        </g>
      )}
    </svg>
  );
}
