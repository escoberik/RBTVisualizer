import RBTree from "../RBT/RBTree";
import SvgDefs from "./TreeVisualizerSvgDefs";
import { LeafNode, NilNode } from "./TreeVisualizerComponents";
import { Layout } from "./TreeVisualizerLayout";

export default function TreeRenderer({ tree }: { tree: RBTree }) {
  const layout = Layout.from(tree.root);
  const { x, y, width, height } = layout.size;

  return (
    <svg viewBox={`${x} ${y} ${width} ${height}`} width={width} className="tree-svg">
      <SvgDefs />
      {layout.nodes.length === 0 && <NilNode x={0} y={0} />}
      {layout.nodes.map(({ key, ...props }) => (
        <LeafNode key={key} {...props} />
      ))}
    </svg>
  );
}
