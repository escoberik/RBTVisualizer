# rendering/

SVG rendering pipeline. Takes `Layout` snapshots from `History` and turns
them into an animated SVG tree.

For the coordinate system, level doubling, and pipeline overview, see
[`../README.md`](../README.md).

---

## Files

### `Snapshot.ts`

Visualization adapter. Wraps `RBT/Layout` and produces `NodeLayout` records
and edge pairs that `Renderer` and `useLayoutTransition` can consume directly.
Doubles all RBT levels so there is vertical space for arrow glyphs between
parent and child nodes.

### `math.ts`

Shared numeric utilities: `lerp` (linear interpolation between two numbers) and
`lerpColor` (channel-wise interpolation between two hex colors). Used by
`NodeBody` and `useLayoutTransition`.

### `useLayoutTransition.ts`

Animation hook. Drives smooth transitions between `Layout` snapshots using
`requestAnimationFrame` and an ease-in-out curve. Returns an `AnimatedLayout`
with per-node interpolated fields:

| Field | Meaning |
|-------|---------|
| `offset` | horizontal grid position |
| `level` | vertical grid position |
| `colorT` | `0` = black, `1` = red |
| `highlightT` | `0` = normal, `1` = highlighted |
| `opacity` | `0` = invisible, `1` = fully visible |
| `scale` | `0 → 1` for newly inserted nodes |

### `Renderer.tsx`

SVG composer. Sets up the `viewBox` from the stable `viewport` size (provided
by `History`), then renders in order:

1. Edges — rendered first so arrowheads sit beneath node circles
2. Tree nodes
3. Floating node (if present) — always red, always highlighted

### `SvgDefs.tsx`

Shared SVG filter definitions injected once into the SVG. Currently defines
`nodeHighlightRing`, the blur/glow filter used by the highlight ring circle
in `NodeBody`.

Per-node gradients and filters are defined inline inside `NodeBody` because
they are parameterized by `colorT` and `highlightT` and must update every
animation frame.

### `TreeNode.tsx`

Positions a single node in the SVG via `transform="translate(...)"` and
applies opacity and scale from the animated layout. Delegates the visual
circle rendering to `NodeBody`.

### `NodeBody.tsx`

The visual ball. Renders:
- A radial gradient `<circle>` (colors from `ColorsContext`)
- A per-node drop-shadow `<filter>`
- An optional highlight ring `<circle>` (when `highlightT > 0`)
- A centered `<text>` label

All gradient and filter IDs are scoped per node via `nodeId` to prevent SVG
ID collisions when multiple instances render on the same page.

### `Edge.tsx`

Renders a directed arrow between a parent and child node. The endpoint
positions and angle are computed at render time from the animated node
layouts, so edges correctly track their nodes during movement.
