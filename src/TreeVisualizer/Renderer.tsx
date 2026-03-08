import type Snapshot from "./Snapshot";
import SvgDefs from "./SvgDefs";
import { LeafNode, NilNode, StandaloneNode } from "./Components";
import { Layout, ROW_HEIGHT } from "./Layout";

export default function Renderer({ snapshot }: { snapshot: Snapshot | null }) {
  const layout = Layout.from(snapshot?.root ?? null);
  const { x, y, width, height } = layout.bounds;

  return (
    <svg viewBox={`${x} ${y} ${width} ${height}`} width={width} className="tree-svg">
      <SvgDefs />
      {snapshot?.isNew && <StandaloneNode x={0} y={-ROW_HEIGHT} node={snapshot.operands[0]} className="node-appear" />}
      {layout.nodes.length === 0 && <NilNode x={0} y={0} />}
      {layout.nodes.map(({ key, ...props }) => (
        <LeafNode key={key} {...props} />
      ))}
    </svg>
  );
}
