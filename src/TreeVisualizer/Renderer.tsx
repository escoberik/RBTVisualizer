import { useState, useEffect, useRef } from "react";
import type Snapshot from "./Snapshot";
import SvgDefs from "./SvgDefs";
import { LeafNode, NilNode, StandaloneNode } from "./Components";
import { Layout, ROW_HEIGHT, NODE_RADIUS, NIL_RADIUS } from "./Layout";
import type { LeafNodeProperties } from "./Layout";
import { colors } from "./colors";
import type { OperationNode } from "./Snapshot";

function GrowingArrow({ x: ex, y: ey }: { x: number; y: number }) {
  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    const duration = 1000;
    let startTime: number | null = null;
    let rafId: number;

    function animate(time: number) {
      if (startTime === null) startTime = time;
      const raw = Math.min((time - startTime) / duration, 1);
      const t = raw * (2 - raw); // ease-out
      const cx = String(ex * t);
      const cy = String(ey * t);
      line1Ref.current?.setAttribute("x2", cx);
      line1Ref.current?.setAttribute("y2", cy);
      line2Ref.current?.setAttribute("x2", cx);
      line2Ref.current?.setAttribute("y2", cy);
      if (raw < 1) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [ex, ey]);

  return (
    <g filter="url(#edgeShadow)">
      <line
        ref={line1Ref}
        x1={0}
        y1={0}
        x2={0}
        y2={0}
        stroke={colors.edge}
        strokeWidth={4}
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
      <line
        ref={line2Ref}
        x1={0}
        y1={0}
        x2={0}
        y2={0}
        stroke={colors.edgeHighlight}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </g>
  );
}

function GhostNode({
  x,
  y,
  node,
  arrow,
}: {
  x: number;
  y: number;
  node: OperationNode;
  arrow?: { x: number; y: number };
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
      {arrow && (
        <GrowingArrow key={`${arrow.x}-${arrow.y}`} x={arrow.x} y={arrow.y} />
      )}
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

    if (
      snapshot?.isInsertingUnder ||
      snapshot?.isComparingLeft ||
      snapshot?.isComparingRight
    ) {
      const parent = layout.nodes.find(
        (n) => n.node.value === snapshot.operands[1].value,
      );
      if (!parent) return null;

      let arrow: { x: number; y: number } | undefined;
      if (snapshot.isComparingLeft || snapshot.isComparingRight) {
        const child = snapshot.isComparingLeft ? parent.left : parent.right;
        const dx = child.x - parent.x;
        const dy = child.y - parent.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const childRadius = child.isNil ? NIL_RADIUS : NODE_RADIUS;
        const scale = len > 0 ? (len - childRadius) / len : 0;
        arrow = { x: dx * scale, y: dy * scale };
      }

      return {
        x: parent.x,
        y: parent.y - (ROW_HEIGHT * 2) / 3,
        node: snapshot.operands[0],
        arrow,
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
        <GhostNode
          key="ghost"
          x={ghost.x}
          y={ghost.y}
          node={ghost.node}
          arrow={ghost.arrow}
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
