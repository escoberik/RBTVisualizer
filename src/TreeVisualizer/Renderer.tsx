import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import type Snapshot from "./Snapshot";
import SvgDefs from "./SvgDefs";
import { LeafNode, NilNode, StandaloneNode } from "./Components";
import { Layout, ROW_HEIGHT, NODE_RADIUS } from "./Layout";
import type { LeafNodeProperties } from "./Layout";
import { colors } from "./colors";
import type { OperationNode } from "./Snapshot";

/** Duration constants (ms) for all animations in this file.
 *  CSS counterparts live in App.css as --anim-* custom properties. */
const ANIM = {
  ghostSlide: 500,
  ghostFade: 1000,
  arrowGrow: 1000,
  nodeSettle: 800, // keep in sync with --anim-node-settle in App.css
  repaint: 1000,
  rotation: 700,
  // insertPhase1 + insertPhase2 must equal --anim-edge-fade-delay (App.css)
  insertPhase1: 200, // inserted node: ghost position → over parent
  insertPhase2: 600, // inserted node: over parent → final position
} as const;

/** How far above its parent the ghost node hovers during inserting_under. */
const GHOST_ABOVE = (ROW_HEIGHT * 2) / 3;

function GrowingArrow({ x: ex, y: ey }: { x: number; y: number }) {
  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    // Refs + rAF loop instead of state: avoids React re-renders on every frame,
    // and keeps markerEnd tracking the live (x2,y2) endpoint throughout growth.
    const duration = ANIM.arrowGrow;
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
        transition: `transform ${ANIM.ghostSlide}ms ease, opacity ${ANIM.ghostFade}ms ease`,
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
        transition: `transform ${ANIM.nodeSettle}ms ease`,
      }}
    >
      <LeafNode {...props} className="settling-leaf" />
    </g>
  );
}

// Trivial wrapper used by Renderer to attach insertGroupRef to the moving node.
function InsertingNode({
  groupRef,
  ...props
}: LeafNodeProperties & { groupRef: React.RefObject<SVGGElement> }) {
  return (
    <g ref={groupRef}>
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
            transition: `opacity ${ANIM.repaint}ms ease-in-out`,
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

/**
 * Wraps a LeafNode with a CSS-transition slide from its pre-rotation position.
 * `fromDx` / `fromDy` are the offset (prevX - currentX, prevY - currentY).
 * The wrapper starts there and transitions to translate(0,0).
 */
function RotatingNode({
  fromDx,
  fromDy,
  ...props
}: LeafNodeProperties & { fromDx: number; fromDy: number }) {
  const [offset, setOffset] = useState({ dx: fromDx, dy: fromDy });
  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset({ dx: 0, dy: 0 }));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <g
      style={{
        transform: `translate(${offset.dx}px, ${offset.dy}px)`,
        transition: `transform ${ANIM.rotation}ms ease-in-out`,
      }}
    >
      <LeafNode {...props} />
    </g>
  );
}

export default function Renderer({ snapshot }: { snapshot: Snapshot | null }) {
  const layout = Layout.from(snapshot?.root ?? null);

  // Track the layout from the PREVIOUS snapshot so rotation animations can
  // diff where each node came from.
  //
  // We update these refs during render (not in an effect) so the previous
  // layout is always available synchronously when computing rotationOffsets.
  // Comparing snapshotRef to the current snapshot guards against the double-
  // render in React Strict Mode: we only advance prevLayoutRef when the
  // snapshot identity actually changes.
  const snapshotRef = useRef<Snapshot | null>(null);
  const prevLayoutRef = useRef<Layout>(Layout.from(null));
  const committedLayoutRef = useRef<Layout>(Layout.from(null));

  if (snapshotRef.current !== snapshot) {
    prevLayoutRef.current = committedLayoutRef.current;
    committedLayoutRef.current = layout;
    snapshotRef.current = snapshot;
  }

  // For rotation snapshots, compute the (dx, dy) from the previous position
  // to the current position for every node that moved.
  const rotationOffsets = (() => {
    if (!snapshot?.isRotatedLeft && !snapshot?.isRotatedRight) return null;
    const prevNodes = prevLayoutRef.current.nodes;
    const offsets = new Map<number, { dx: number; dy: number }>();
    for (const { node, x, y } of layout.nodes) {
      const prev = prevNodes.find((n) => n.node.value === node.value);
      if (prev && (prev.x !== x || prev.y !== y)) {
        offsets.set(node.value, { dx: prev.x - x, dy: prev.y - y });
      }
    }
    return offsets.size > 0 ? offsets : null;
  })();

  // Delay viewBox resize during insertion animations so the SVG doesn't
  // expand until the node has settled into its final position.
  const [viewBoxBounds, setViewBoxBounds] = useState(layout.bounds);
  useLayoutEffect(() => {
    const bounds = Layout.from(snapshot?.root ?? null).bounds;
    if (snapshot?.isInsertedRoot) {
      const t = setTimeout(() => setViewBoxBounds(bounds), ANIM.nodeSettle);
      return () => clearTimeout(t);
    }
    if (snapshot?.isInsertedLeft || snapshot?.isInsertedRight) {
      const t = setTimeout(
        () => setViewBoxBounds(bounds),
        ANIM.insertPhase1 + ANIM.insertPhase2,
      );
      return () => clearTimeout(t);
    }
    setViewBoxBounds(bounds);
  }, [snapshot]);

  const { x, y, width, height } = viewBoxBounds;

  // Refs for the insertion animation. Held at Renderer level so the animated
  // edge can be rendered BEFORE layout.nodes.map, keeping it behind all nodes.
  const insertGroupRef = useRef<SVGGElement>(null);
  const insertEdge1Ref = useRef<SVGLineElement>(null);
  const insertEdge2Ref = useRef<SVGLineElement>(null);

  useLayoutEffect(() => {
    if (!(snapshot?.isInsertedLeft || snapshot?.isInsertedRight)) return;
    const childNode = layout.nodes.find(
      (n) => n.node.value === snapshot.operands[0].value,
    );
    const parentNode = layout.nodes.find(
      (n) => n.node.value === snapshot.operands[1].value,
    );
    if (!childNode || !parentNode) return;

    const ghostOffsetX = parentNode.x - childNode.x;
    const ghostOffsetY = parentNode.y - GHOST_ABOVE - childNode.y;
    const parentOffsetX = parentNode.x - childNode.x;
    const parentOffsetY = parentNode.y - childNode.y;

    if (insertGroupRef.current) {
      insertGroupRef.current.style.transform = `translate(${ghostOffsetX}px, ${ghostOffsetY}px)`;
    }
    const ex0 = ghostOffsetX - parentOffsetX;
    const ey0 = ghostOffsetY - parentOffsetY;
    const len0 = Math.sqrt(ex0 * ex0 + ey0 * ey0);
    const s0 = len0 > NODE_RADIUS ? (len0 - NODE_RADIUS) / len0 : 0;
    insertEdge1Ref.current?.setAttribute("x2", String(ex0 * s0));
    insertEdge1Ref.current?.setAttribute("y2", String(ey0 * s0));
    insertEdge2Ref.current?.setAttribute("x2", String(ex0 * s0));
    insertEdge2Ref.current?.setAttribute("y2", String(ey0 * s0));
  }, [snapshot]);

  useEffect(() => {
    if (!(snapshot?.isInsertedLeft || snapshot?.isInsertedRight)) return;
    const childNode = layout.nodes.find(
      (n) => n.node.value === snapshot.operands[0].value,
    );
    const parentNode = layout.nodes.find(
      (n) => n.node.value === snapshot.operands[1].value,
    );
    if (!childNode || !parentNode) return;

    const ghostOffsetX = parentNode.x - childNode.x;
    const ghostOffsetY = parentNode.y - GHOST_ABOVE - childNode.y;
    const parentOffsetX = parentNode.x - childNode.x;
    const parentOffsetY = parentNode.y - childNode.y;

    let rafId: number;
    let startTime: number | null = null;
    const totalDuration = ANIM.insertPhase1 + ANIM.insertPhase2;

    function ease(t: number) {
      return t * (2 - t);
    }

    function animate(time: number) {
      if (startTime === null) startTime = time;
      const elapsed = Math.min(time - startTime, totalDuration);

      let dx: number, dy: number;
      if (elapsed <= ANIM.insertPhase1) {
        const t = ease(elapsed / ANIM.insertPhase1);
        dx = ghostOffsetX + (parentOffsetX - ghostOffsetX) * t;
        dy = ghostOffsetY + (parentOffsetY - ghostOffsetY) * t;
      } else {
        const t = ease((elapsed - ANIM.insertPhase1) / ANIM.insertPhase2);
        dx = parentOffsetX * (1 - t);
        dy = parentOffsetY * (1 - t);
      }

      if (insertGroupRef.current) {
        insertGroupRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      const ex = dx - parentOffsetX;
      const ey = dy - parentOffsetY;
      const len = Math.sqrt(ex * ex + ey * ey);
      const scale = len > NODE_RADIUS ? (len - NODE_RADIUS) / len : 0;
      insertEdge1Ref.current?.setAttribute("x2", String(ex * scale));
      insertEdge1Ref.current?.setAttribute("y2", String(ey * scale));
      insertEdge2Ref.current?.setAttribute("x2", String(ex * scale));
      insertEdge2Ref.current?.setAttribute("y2", String(ey * scale));

      if (elapsed < totalDuration) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [snapshot]);

  // Final edge endpoint for JSX (so React restores the correct value on
  // any re-render that occurs after the rAF loop ends).
  const insertEdgeJsx = (() => {
    if (!(snapshot?.isInsertedLeft || snapshot?.isInsertedRight)) return null;
    const childNode = layout.nodes.find(
      (n) => n.node.value === snapshot.operands[0].value,
    );
    const parentNode = layout.nodes.find(
      (n) => n.node.value === snapshot.operands[1].value,
    );
    if (!childNode || !parentNode) return null;

    const fex = childNode.x - parentNode.x;
    const fey = childNode.y - parentNode.y;
    const flen = Math.sqrt(fex * fex + fey * fey);
    const fscale = flen > NODE_RADIUS ? (flen - NODE_RADIUS) / flen : 0;
    return {
      parentSvgX: parentNode.x,
      parentSvgY: parentNode.y,
      finalEdgeX: fex * fscale,
      finalEdgeY: fey * fscale,
    };
  })();

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

      const arrow = snapshot.isComparingLeft
        ? (layout.arrowEndpoint(snapshot.operands[1].value, "left") ??
          undefined)
        : snapshot.isComparingRight
          ? (layout.arrowEndpoint(snapshot.operands[1].value, "right") ??
            undefined)
          : undefined;

      return {
        x: parent.x,
        y: parent.y - GHOST_ABOVE,
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
      {/* Animated insertion edge — rendered before all nodes so it sits
          behind every node circle regardless of in-order position. */}
      {insertEdgeJsx && (
        <g
          transform={`translate(${insertEdgeJsx.parentSvgX}, ${insertEdgeJsx.parentSvgY})`}
        >
          <g filter="url(#edgeShadow)">
            <line
              ref={insertEdge1Ref}
              x1={0}
              y1={0}
              x2={insertEdgeJsx.finalEdgeX}
              y2={insertEdgeJsx.finalEdgeY}
              stroke={colors.edge}
              strokeWidth={4}
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
            />
            <line
              ref={insertEdge2Ref}
              x1={0}
              y1={0}
              x2={insertEdgeJsx.finalEdgeX}
              y2={insertEdgeJsx.finalEdgeY}
              stroke={colors.edgeHighlight}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
          </g>
        </g>
      )}
      {layout.nodes.length === 0 && <NilNode x={0} y={0} />}
      {layout.nodes.map(({ key, ...props }) => {
        if (
          snapshot?.isInsertedRoot &&
          props.node.value === snapshot.operands[0].value
        ) {
          return <SettlingNode key={key} {...props} />;
        }
        if (snapshot?.isInsertedLeft || snapshot?.isInsertedRight) {
          // Hide the static edge on the parent; the animated edge above replaces it.
          if (props.node.value === snapshot.operands[1].value) {
            return (
              <LeafNode
                key={key}
                {...props}
                hideLeft={snapshot.isInsertedLeft}
                hideRight={snapshot.isInsertedRight}
              />
            );
          }
          if (props.node.value === snapshot.operands[0].value) {
            return (
              <InsertingNode key={key} {...props} groupRef={insertGroupRef} />
            );
          }
        }
        if (
          snapshot?.isRepaintedRoot &&
          props.node.value === snapshot.operands[0].value
        ) {
          return <RepaintingNode key={key} {...props} />;
        }
        const rotOffset = rotationOffsets?.get(props.node.value);
        if (rotOffset) {
          return (
            <RotatingNode
              key={key}
              {...props}
              fromDx={rotOffset.dx}
              fromDy={rotOffset.dy}
            />
          );
        }
        return <LeafNode key={key} {...props} />;
      })}
    </svg>
  );
}
