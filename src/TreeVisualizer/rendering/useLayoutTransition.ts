import { useEffect, useReducer, useRef } from "react";
import type Layout from "./Layout";
import type { FloatingNode } from "./Layout";

// ─── Animated types ──────────────────────────────────────────────────────────

export interface AnimatedNodeLayout {
  offset: number;
  level: number;
  colorT: number; // 0 = black, 1 = red
  highlightT: number; // 0 = normal, 1 = highlighted
  opacity: number;
  scale: number;
}

export interface AnimatedEdge<T> {
  parent: T;
  child: T;
  opacity: number;
}

export interface AnimatedFloatingNode<T> extends FloatingNode<T> {
  opacity: number;
}

export interface AnimatedLayout<T> {
  description: string;
  size: { width: number; height: number };
  nodeLayouts: ReadonlyMap<T, AnimatedNodeLayout>;
  edges: ReadonlyArray<AnimatedEdge<T>>;
  floatingNode: AnimatedFloatingNode<T> | undefined;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function edgeKey<T>(parent: T, child: T): string {
  return `${String(parent)}:${String(child)}`;
}

// Wrap a static layout as a fully-opaque, scale=1 AnimatedLayout.
function freeze<T>(layout: Layout<T>): AnimatedLayout<T> {
  const nodes = new Map<T, AnimatedNodeLayout>();
  for (const [value, nl] of layout.nodeLayouts) {
    nodes.set(value, {
      offset: nl.offset,
      level: nl.level,
      colorT: nl.red ? 1 : 0,
      highlightT: nl.highlight ? 1 : 0,
      opacity: 1,
      scale: 1,
    });
  }
  return {
    description: layout.description,
    size: layout.size,
    nodeLayouts: nodes,
    edges: layout.edges.map(e => ({ ...e, opacity: 1 })),
    floatingNode: layout.floatingNode
      ? { ...layout.floatingNode, opacity: 1 }
      : undefined,
  };
}

function interpolate<T>(
  from: Layout<T>,
  to: Layout<T>,
  t: number,
): AnimatedLayout<T> {
  const nodes = new Map<T, AnimatedNodeLayout>();

  const fF = from.floatingNode;
  const tF = to.floatingNode;

  // Moved nodes (in both layouts) and disappeared nodes (only in from)
  for (const [value, f] of from.nodeLayouts) {
    const g = to.nodeLayouts.get(value);
    if (g) {
      nodes.set(value, {
        offset: lerp(f.offset, g.offset, t),
        level: lerp(f.level, g.level, t),
        colorT: lerp(f.red ? 1 : 0, g.red ? 1 : 0, t),
        highlightT: lerp(f.highlight ? 1 : 0, g.highlight ? 1 : 0, t),
        opacity: 1,
        scale: 1,
      });
    } else if (tF && tF.value === value) {
      // Floating node lifting off: slide from tree position back to floating position
      nodes.set(value, {
        offset: lerp(f.offset, tF.offset, t),
        level:  lerp(f.level,  tF.level,  t),
        colorT:     f.red       ? 1 : 0,
        highlightT: f.highlight ? 1 : 0,
        opacity: 1,
        scale:   1,
      });
    } else {
      // Disappearing — fade out at its last known position
      nodes.set(value, {
        offset: f.offset,
        level: f.level,
        colorT: f.red ? 1 : 0,
        highlightT: 0,
        opacity: lerp(1, 0, t),
        scale: 1,
      });
    }
  }

  // Appeared nodes (only in to) — pop in, unless the node was the floating node,
  // in which case animate from its floating position to its tree position.
  for (const [value, g] of to.nodeLayouts) {
    if (!from.nodeLayouts.has(value)) {
      if (fF && fF.value === value) {
        // Floating node landing: slide from floating position into the tree
        nodes.set(value, {
          offset: lerp(fF.offset, g.offset, t),
          level:  lerp(fF.level,  g.level,  t),
          colorT:     g.red       ? 1 : 0,
          highlightT: g.highlight ? 1 : 0,
          opacity: 1,
          scale:   1,
        });
      } else {
        nodes.set(value, {
          offset: g.offset, level: g.level,
          colorT: g.red ? 1 : 0, highlightT: g.highlight ? 1 : 0,
          opacity: lerp(0, 1, t), scale: lerp(0, 1, t),
        });
      }
    }
  }

  // Edges — crossfade between old and new topology; positions track animated nodes
  const toEdgeKeys = new Set(to.edges.map(e => edgeKey(e.parent, e.child)));
  const fromEdgeKeys = new Set(from.edges.map(e => edgeKey(e.parent, e.child)));
  const edges: AnimatedEdge<T>[] = [];
  for (const e of from.edges) {
    edges.push({ ...e, opacity: toEdgeKeys.has(edgeKey(e.parent, e.child)) ? 1 : lerp(1, 0, t) });
  }
  for (const e of to.edges) {
    if (!fromEdgeKeys.has(edgeKey(e.parent, e.child))) {
      edges.push({ ...e, opacity: lerp(0, 1, t) });
    }
  }

  // Floating node
  let floatingNode: AnimatedFloatingNode<T> | undefined;
  if (fF && tF && fF.value === tF.value) {
    // Same value moving between two layouts that both show it floating
    floatingNode = {
      value:  fF.value,
      offset: lerp(fF.offset, tF.offset, t),
      level:  lerp(fF.level,  tF.level,  t),
      opacity: 1,
    };
  } else if (fF && !tF) {
    if (to.nodeLayouts.has(fF.value)) {
      // Floating node landed in the tree — tree node animation handles it, hide the float
      floatingNode = undefined;
    } else {
      floatingNode = { ...fF, opacity: lerp(1, 0, t) };
    }
  } else if (tF) {
    if (from.nodeLayouts.has(tF.value)) {
      // Floating node lifting off — tree node animation handles it, hide the float
      floatingNode = undefined;
    } else {
      floatingNode = { ...tF, opacity: lerp(0, 1, t) };
    }
  }

  return {
    description: to.description,
    size: to.size,
    nodeLayouts: nodes,
    edges,
    floatingNode,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLayoutTransition(
  layout: Layout<number>,
  duration = 1000,
): AnimatedLayout<number> {
  const fromRef = useRef<Layout<number>>(layout);
  const toRef = useRef<Layout<number>>(layout);
  const progressRef = useRef(1);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  // Detect layout change during render (ref mutation is safe — idempotent, no state).
  // Cancel any in-flight RAF so the new effect starts clean.
  if (toRef.current !== layout) {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    fromRef.current = toRef.current;
    toRef.current = layout;
    progressRef.current = 0;
    startTimeRef.current = null;
  }

  useEffect(() => {
    if (progressRef.current >= 1) return;

    function tick(now: number) {
      if (startTimeRef.current === null) startTimeRef.current = now;
      progressRef.current = Math.min(
        (now - startTimeRef.current) / duration,
        1,
      );
      forceUpdate();
      if (progressRef.current < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [layout, duration]);

  if (progressRef.current >= 1) return freeze(layout);
  return interpolate(
    fromRef.current,
    toRef.current,
    easeInOut(progressRef.current),
  );
}
