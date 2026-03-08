import { useState, useEffect } from "react";
import type Snapshot from "./Snapshot";
import SvgDefs from "./SvgDefs";
import { LeafNode, NilNode, StandaloneNode } from "./Components";
import { Layout, ROW_HEIGHT, NODE_RADIUS } from "./Layout";
import type { LeafNodeProperties } from "./Layout";
import { colors } from "./colors";
import type { OperationNode } from "./Snapshot";

function GhostNode({
  x,
  y,
  node,
}: {
  x: number;
  y: number;
  node: OperationNode;
}) {
  const [pos, setPos] = useState({ x, y });
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setPos({ x, y });
      setOpacity(1);
    });
    return () => cancelAnimationFrame(id);
  }, [x, y]);
  return (
    <g
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        opacity,
        transition: "transform 0.5s ease, opacity 1s ease",
      }}
    >
      <StandaloneNode x={0} y={0} node={node} />
    </g>
  );
}

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

  const ghost = (() => {
    if (snapshot?.isNew)
      return { x: 0, y: -ROW_HEIGHT, node: snapshot.operands[0] };
    if (snapshot?.isInsertingUnder) {
      const parent = layout.nodes.find(
        (n) => n.node.value === snapshot.operands[1].value,
      );
      if (parent)
        return {
          x: parent.x,
          y: parent.y - ROW_HEIGHT / 2,
          node: snapshot.operands[0],
        };
    }
    return null;
  })();

  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      width={width}
      className="tree-svg"
    >
      <SvgDefs />
      {ghost && (
        <GhostNode key="ghost" x={ghost.x} y={ghost.y} node={ghost.node} />
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
