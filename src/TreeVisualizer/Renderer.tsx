import { useState, useEffect } from "react";
import type Snapshot from "./Snapshot";
import SvgDefs from "./SvgDefs";
import { LeafNode, NilNode, StandaloneNode } from "./Components";
import { Layout, ROW_HEIGHT, NODE_RADIUS } from "./Layout";
import type { LeafNodeProperties } from "./Layout";
import { colors } from "./colors";

function SettlingNode(props: LeafNodeProperties) {
  const [dy, setDy] = useState(-ROW_HEIGHT);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDy(0));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <g
      style={{
        transform: `translate(0px, ${dy}px)`,
        transition: "transform 0.8s ease",
      }}
    >
      <LeafNode {...props} className="settling-leaf" />
    </g>
  );
}

function RepaintingNode(props: LeafNodeProperties) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <>
      <LeafNode {...props} />
      <g transform={`translate(${props.x}, ${props.y})`}>
        <g
          style={{
            opacity: started ? 0 : 1,
            transition: "opacity 1s ease-in-out",
          }}
        >
          <circle
            cx={0}
            cy={0}
            r={NODE_RADIUS}
            fill="url(#nodeRedGradient)"
            stroke={colors.nodeRedDark}
            strokeWidth="1"
            filter="url(#nodeRedGlow)"
          />
        </g>
      </g>
    </>
  );
}

export default function Renderer({ snapshot }: { snapshot: Snapshot | null }) {
  const layout = Layout.from(snapshot?.root ?? null);
  const { x, y, width, height } = layout.bounds;

  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      width={width}
      className="tree-svg"
    >
      <SvgDefs />
      {snapshot?.isNew && (
        <StandaloneNode
          x={0}
          y={-ROW_HEIGHT}
          node={snapshot.operands[0]}
          className="node-appear"
        />
      )}
      {layout.nodes.length === 0 && <NilNode x={0} y={0} />}
      {layout.nodes.map(({ key, ...props }) => {
        if (
          snapshot?.isInsertedRoot &&
          props.node.value === snapshot.operands[0].value
        ) {
          return <SettlingNode key={key} {...props} />;
        }
        if (
          snapshot?.isRepaintedRoot &&
          props.node.value === snapshot.operands[0].value
        ) {
          return <RepaintingNode key={key} {...props} />;
        }
        return <LeafNode key={key} {...props} />;
      })}
    </svg>
  );
}
