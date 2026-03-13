import type Layout from "./Layout";
import SvgDefs from "./SvgDefs";
import { TreeNode } from "./components";
import { SLOT, PADDING } from "./constants";

export default function Renderer({
  layout,
  viewport,
}: {
  layout: Layout<number>;
  viewport: { width: number; height: number };
}) {
  const vbWidth = viewport.width + 2 * PADDING;
  // viewport.height is a slot count, so the visual span is height-1 (first to last slot).
  // viewport.width is already a full span, so no -1 needed there.
  const vbHeight = viewport.height - 1 + 2 * PADDING;

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
          value={node.value}
          red={node.isRed}
          layout={nodeLayout}
        />
      ))}
    </svg>
  );
}
