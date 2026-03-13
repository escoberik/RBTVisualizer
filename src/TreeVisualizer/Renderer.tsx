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
  const halfWidth = viewport.width / 2;
  const vbWidth = viewport.width + 2 * PADDING;
  // viewport.height is a slot count, so the visual span is height-1 (first to last slot).
  // halfWidth centers the root (offset=0) in the middle of the stable viewport.
  const vbHeight = viewport.height - 1 + 2 * PADDING;

  return (
    <svg
      viewBox={`${-halfWidth - PADDING} ${-PADDING} ${vbWidth} ${vbHeight}`}
      width={vbWidth * SLOT}
      className="tree-svg"
    >
      <SvgDefs />
      {[...layout.nodeLayouts.entries()].map(([value, nodeLayout]) => (
        <TreeNode
          key={value}
          value={value}
          red={nodeLayout.red}
          layout={nodeLayout}
        />
      ))}
    </svg>
  );
}
