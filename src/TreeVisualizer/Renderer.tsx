import type Node from "../RBT/Node";
import type Layout from "./Layout";
import SvgDefs from "./SvgDefs";
import { TreeNode } from "./Components";
import { SLOT, PADDING } from "./constants";

export default function Renderer({
  root,
  layout,
}: {
  root: Node<number>;
  layout: Layout<number>;
}) {
  if (root.isNil) return null;

  const vbWidth = layout.size.width + 2 * PADDING;
  // size.height is a slot count, so the visual span is size.height-1 (first to last slot).
  // size.width is already a full span, so no -1 needed there.
  const vbHeight = layout.size.height - 1 + 2 * PADDING;

  return (
    <svg
      viewBox={`${-PADDING} ${-PADDING} ${vbWidth} ${vbHeight}`}
      width={vbWidth * SLOT}
      className="tree-svg"
    >
      <SvgDefs />
      {[...layout.nodeLayouts.entries()].map(([node, nodeLayout]) => (
        <TreeNode
          key={node.value}
          node={node}
          layout={nodeLayout}
        />
      ))}
    </svg>
  );
}
