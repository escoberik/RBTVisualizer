# TreeVisualizer

The rendering and animation layer for the Red-Black Tree visualizer. Takes the
pure-math output of `RBT/` and turns it into an interactive, animated SVG. Each
layer in this pipeline knows as little as possible about the layers below it.

---

## Pipeline overview

```
RBT/Tree  ──(LogFn)──→  History  ──→  Layout  ──→  useLayoutTransition  ──→  Renderer  ──→  SVG
            events        snapshots     positions       animated positions
```

1. `RBT/Tree` mutates itself and fires events through the `LogFn` callback.
2. `History` catches those events, wraps each in a `Layout` snapshot, and
   stores the sequence.
3. `TreeVisualizer` (the root component) navigates `History` by index.
4. `useLayoutTransition` interpolates between the current and previous
   `Layout` over 1 second using `requestAnimationFrame`.
5. `Renderer` maps the `AnimatedLayout` to SVG elements.

---

## Coordinate system

All SVG internals use **grid units**, not pixels. `SLOT = 40` is the only
place that converts grid units to pixels, used exclusively in the SVG `width`
attribute:

```typescript
width={vbWidth * SLOT}   // e.g. 10 units × 40px/unit = 400px
```

Everything else — radii, stroke widths, font sizes, filter offsets — is a
fraction of one grid unit. `NODE_RADIUS = 0.55` means 22 px at the default
scale. Changing `SLOT` rescales the entire visualization uniformly.

### Level doubling

`RBT/Layout` assigns each node an integer `level` starting at 0. Adjacent
levels are 1 unit apart — not enough vertical space for arrow glyphs.
`TreeVisualizer/Layout` doubles all levels before storing them:

```
RBT level:  0  1  2  3  …
TV level:   0  2  4  6  …
```

Nodes land on even slots; the odd slots between them hold the arrows.
`LEVEL_GAP = 2` records this vertical distance between parent and child.

---

## Files

### `TreeVisualizer.tsx` — root component

Owns the `Tree` and `History` instances in a stable ref (never recreated on
re-render). Both operations follow the same pattern:

**Insert:**
1. Calls `history.reset(tree.root, value)` to snapshot the before-state with
   the value floating.
2. Calls `tree.insert(value)`, which fires events through `history.append`.
3. Resets the step index to 0 so playback starts from the beginning.

**Find:**
1. Calls `history.reset(tree.root, value)` — same setup, floating value is the
   search target.
2. Calls `tree.find(value)`, which fires traversal and terminal events.
3. If the tree is empty (no events were fired), appends a final "Not found"
   snapshot via `history.appendFinal`.
4. Resets the step index to 0.

Step navigation (first / prev / next / last) moves the index through
`history`'s snapshot array.

### `History.ts` — snapshot collector

`History<T>` receives `(event, root, subject)` callbacks from `RBT/Tree` and
stores each as a `Layout<T>` with a human-readable description. It also tracks
`_floatingValue` — the active value (being inserted or searched) — and injects
it into `Layout` so the floating node animation knows which node to float.

A stable `size` property tracks the maximum `{ width, height }` seen across all
snapshots. `Renderer` uses this to keep the SVG viewport constant while
stepping through history, preventing layout jumps as the tree grows.

### `Layout.ts` — visualization adapter

`Layout<T>` wraps `RBT/Layout` and produces data structures that `Renderer`
and `useLayoutTransition` can consume directly.

**`NodeLayout`:**

```typescript
interface NodeLayout {
  red: boolean;       // true → red node
  highlight: boolean; // true → active node for this step
  offset: number;     // horizontal grid coordinate (root-relative)
  level: number;      // vertical grid coordinate (doubled)
}
```

All offsets are **root-relative**: the root is always at offset 0, children
are ± from it. This is what keeps the viewport centered on the root across all
steps.

**Floating node:** during `COMPARE_LEFT` / `COMPARE_RIGHT` steps, a floating
node (the active value — being inserted or searched) hovers 1.5 units above the
highlighted comparison node. If no highlight match exists (e.g., `INITIAL`), it
floats to the left of the tree. On an empty tree it hovers at center-left. At
`FOUND`, `NOT_FOUND`, and `INSERT`, no floating node is shown.

**Edges:** stored as `{ parent: T, child: T }` pairs. Positions are computed
at render time from the animated node layouts, so edges correctly track nodes
during movement.

### `useLayoutTransition.ts` — animation hook

Drives smooth transitions between `Layout` snapshots using
`requestAnimationFrame`. Returns an `AnimatedLayout<T>` whose numeric fields
are linearly interpolated between the previous and next `Layout` with an
ease-in-out curve.

**Interpolated fields per node:**

| Field | From → To |
|-------|-----------|
| `offset` | previous position → new position |
| `level` | previous level → new level |
| `colorT` | `0` (black) or `1` (red) → new color value |
| `highlightT` | `0` (normal) or `1` (highlighted) → new value |
| `opacity` | `1 → 0` (disappearing) or `0 → 1` (appearing) |
| `scale` | `0 → 1` for newly popped-in nodes |

**Special cases:**

- **Floating node landing** — when the floating node enters the tree, its tree
  node animates from the floating position to its final slot. The separate
  floating node is hidden for that step.
- **Floating node lifting off** — the reverse: tree node slides to the floating
  position; the floating node hides.
- **Same floating value across steps** — the floating node smoothly moves
  between its positions in consecutive layouts.

**Edge interpolation:** edges that exist in both `from` and `to` layouts keep
`opacity = 1`. Disappearing edges fade out; appearing edges fade in.

When `progressRef.current >= 1` (animation complete), the hook returns a frozen
snapshot to avoid per-frame recalculation at rest.

### `Renderer.tsx` — SVG composer

Sets up the SVG `viewBox` to fit the stable `viewport` size with `PADDING`
whitespace around the tree, then renders:

1. **Edges** — one `<Edge>` per `AnimatedEdge`, translated to the parent node's
   animated position. `dx` and `dy` are computed from the difference in
   animated offsets and levels at render time.
2. **Tree nodes** — one `<TreeNode>` per entry in `nodeLayouts`.
3. **Floating node** — if present, a bare `<NodeBody>` translated to the
   floating position (always red, always highlighted).

Edges are rendered before nodes so arrowheads sit beneath node circles.

### `SvgDefs.tsx` — shared SVG resources

Currently defines one shared filter:

| ID | Type | Used by |
|----|------|---------|
| `nodeHighlightRing` | drop shadow filter | the ring `<circle>` in `NodeBody` |

All other visual resources (node gradients and filters) are defined inline
per-node inside `NodeBody`, because they are parameterized by `colorT` and
`highlightT` and must update on every animation frame.

### `colors.ts`

A single `colors` object typed `as const`. Every hex color string in the
codebase lives here — no inline color literals in components.

### `constants.ts`

```typescript
SLOT       = 40    // px per grid unit — only used for SVG width
NODE_RADIUS = 0.55 // 22px — circle radius for internal nodes
PADDING    = 2     // 80px — grid units of whitespace around the tree
LEVEL_GAP  = 2     // vertical distance from a node to its children
```

---

## `components/`

See [`components/README.md`](components/README.md) for details on `TreeNode`,
`NodeBody`, and `Edge`.
