import RBTSnapshot from "../RBT/RBTSnapshot";
import SvgDefs from "./TreeVisualizerSvgDefs";
import { LeafNode, NilNode, StandaloneNode } from "./TreeVisualizerComponents";
import { Layout, ROW_HEIGHT } from "./TreeVisualizerLayout";

export default function TreeRenderer({ snapshot }: { snapshot: RBTSnapshot }) {
  const layout = Layout.from(snapshot.tree.root);
  let { x, y, width, height } = layout.size;

  const isNew = snapshot.operation.type === "new";
  const floatY = -ROW_HEIGHT;

  return (
    <svg viewBox={`${x} ${y} ${width} ${height}`} width={width} className="tree-svg">
      <SvgDefs />
      {isNew && <StandaloneNode x={0} y={floatY} node={snapshot.nodes[0]} className="node-appear" />}
      {layout.nodes.length === 0 && <NilNode x={0} y={0} />}
      {layout.nodes.map(({ key, ...props }) => (
        <LeafNode key={key} {...props} />
      ))}
    </svg>
  );
}
