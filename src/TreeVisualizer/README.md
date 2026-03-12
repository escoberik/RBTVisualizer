# TreeVisualizer

`TreeVisualizer` is the rendering layer for the Red-Black Tree. It takes the
pure-math output of `RBT/Layout` and turns it into an interactive SVG
visualization. The module is organized in a deliberate pipeline — each layer
knows as little as possible about the layers below it.

---

## Architecture

```
RBT/Tree  ──→  TreeVisualizer/Layout  ──→  Renderer  ──→  SVG
              (grid coordinates)       (React + SVG)
                     ↑
               RBT/Layout (internal)
```

- **`RBT/Layout`** — pure math. Computes integer slot positions. No rendering
  knowledge whatsoever.
- **`TreeVisualizer/Layout`** — visualization adapter. Wraps `RBT/Layout` as
  an implementation detail, enriches positions with edge distances, and applies
  the square-grid transform. The only public surface for consumers.
- **`Renderer`** — React component. Translates a `Layout` into SVG elements.
  Has no layout logic.
- **`components/`** — individual SVG primitives (`TreeNode`, `Edge`,
  `NodeBody`), each in its own file. All values in grid units.

---

## Coordinate system

All SVG internals use **grid units**, not pixels. A single constant, `SLOT`,
converts grid units to pixels exactly once — in the SVG `width` attribute:

```typescript
width={vbWidth * SLOT}   // e.g. 10 grid units × 40px = 400px
```

Everything else — radii, stroke widths, font sizes, filter offsets, marker
dimensions — is expressed as a fraction of `SLOT`. For example, `NODE_RADIUS =
0.55` means 22 px when `SLOT = 40`. This keeps all component code
scale-independent: changing `SLOT` rescales the entire visualization.

### The square grid

`RBT/Layout` assigns each node an integer `(offset, level)` position where
adjacent levels differ by 1. At this scale, horizontal and vertical spacing
are different: nodes are 1 unit apart horizontally but 1 unit apart
vertically, leaving no room for arrows between levels.

`TreeVisualizer/Layout` solves this by **doubling all levels**:

```
RBT levels:  0, 1, 2, 3, ...
TV levels:   0, 2, 4, 6, ...
```

Nodes land on even slots; the odd slots between them are reserved for the
arrow space. Because the same `SLOT` constant applies to both axes, each grid
cell is square: 1 grid unit wide and 1 grid unit tall. `LEVEL_GAP = 2`
documents the vertical distance between a node and its children as a
consequence of the level doubling.

The total height of the SVG grid in slots is `height * 2 - 1`, not `height *
2`, because there is no arrow row below the deepest level.

---

## `Layout.ts`

`Layout<T>` is the only public entry point for computing visualization
positions. It wraps `RBTLayout` entirely; consumers never interact with
`RBT/Layout` directly.

### `NodeLayout`

```typescript
interface NodeLayout {
  offset: number;         // absolute horizontal grid coordinate
  level: number;          // absolute vertical grid coordinate (doubled from RBT level)
  leftDistance?: number;  // horizontal distance to left child (undefined if none)
  rightDistance?: number; // horizontal distance to right child (undefined if none)
}
```

`leftDistance` and `rightDistance` are positive numbers representing the
horizontal span from the node to its child. The sign is handled at render time:
`<Edge distance={-leftDistance} />` points left, `<Edge distance={rightDistance} />`
points right.

### Nil children

When `showNil = false` (the default), nil children have no entry in
`nodeLayouts` and `leftDistance`/`rightDistance` are `undefined` for nodes
whose children are nil. When `showNil = true`, nil children get
`distance = 1` — `Grid.LEAF` always packs a nil sentinel one slot adjacent
to its parent.

### Public access

`nodeLayouts` is exposed as a `ReadonlyMap<InternalNode<T>, NodeLayout>`:
consumers can iterate with `.entries()`, look up nodes with `.get()`, and
check presence with `.has()`, but cannot mutate the map.

The map is keyed on `InternalNode<T>` (never the abstract `Node<T>`), so
consumers get full type-safe access to `.value` without any cast.

---

## Rendering pipeline

### `TreeVisualizer` (root component)

Owns the `Tree` instance in a ref (stable across renders) and the current
`Layout` in state. On every insert, it rebuilds the layout and re-renders:

```typescript
function handleInsert(value: number) {
  treeRef.current.insert(value);
  setLayout(new Layout(treeRef.current.root));
}
```

Renders `<Renderer>` for the SVG and `<Controls>` for the input UI.

### `Renderer`

Sets up the SVG viewport and iterates `layout.nodeLayouts.entries()` to
render one `<TreeNode>` per internal node. Uses absolute grid coordinates,
so nodes position themselves independently with no parent-relative
arithmetic:

```typescript
{[...layout.nodeLayouts.entries()].map(([node, nodeLayout]) => (
  <TreeNode key={node.value} node={node} layout={nodeLayout} />
))}
```

- The `viewBox` origin is offset by `-PADDING` on both axes to add whitespace
  around the tree.
- `vbHeight = size.height - 1 + 2 * PADDING`: the `-1` accounts for
  `size.height` being a slot count — the visual span from the first slot to
  the last is `height - 1`.

### `TreeNode`

A `<g>` translated to `(offset, level)` that renders its own edges before
its body:

```tsx
<g transform={`translate(${offset}, ${level})`}>
  {/* !== undefined, not truthy check: distance=0 is a valid vertical edge */}
  {leftDistance !== undefined && <Edge distance={-leftDistance} />}
  {rightDistance !== undefined && <Edge distance={rightDistance} />}
  <NodeBody value={value} red={node.isRed} />
</g>
```

Edges are rendered before `NodeBody` so the node circle appears on top of the
arrow tips.

### `Edge`

Draws an arrow from the node's center toward its child. Given `distance` (signed
horizontal offset) and `LEVEL_GAP` (vertical offset), it computes the arrow's
endpoint shortened by `NODE_RADIUS` so the tip meets the child circle's edge
rather than its center:

```typescript
const x = distance;
const y = LEVEL_GAP;
const len = Math.sqrt(x * x + y * y);
const scale = (len - NODE_RADIUS) / len;
// endpoint: (x * scale, y * scale)
```

Rendered as two overlapping `<line>` elements: a thicker base stroke and a
thinner highlight stroke to give the edge a glossy look.

### `NodeBody`

A `<circle>` with a radial gradient fill and a `<text>` label centered over
it. Takes plain `{ value: number; red: boolean }` — no dependency on
`InternalNode` or any animation type.

---

## `SvgDefs`

Defines all reusable SVG resources referenced by ID elsewhere:

| ID | Type | Used by |
|----|------|---------|
| `nilGradient` | radial gradient | nil sentinel circles |
| `nodeRedGradient` | radial gradient | red node circles |
| `nodeBlackGradient` | radial gradient | black node circles |
| `nilShadow` | drop shadow filter | nil circles |
| `nodeRedGlow` | glow filter | red node circles |
| `nodeShadow` | drop shadow filter | black node circles |
| `edgeShadow` | drop shadow filter | edge line groups |
| `arrowGradient` | linear gradient | arrowhead polygon fill |
| `arrowhead` | marker | edge `markerEnd` |

All numeric values in `SvgDefs` are in grid units. The arrowhead marker uses
`markerUnits="userSpaceOnUse"` so its dimensions are in the same grid unit
coordinate space as the rest of the SVG.

---

## Snapshot system

`Snapshot`, `SnapshotHistory`, and `SnapshotType` implement a step-through
replay system for tree operations. Each snapshot records:

- The tree root at that moment (`RBTNode | null`)
- The operation type (e.g., `"inserted_left"`, `"rotated_right"`)
- The operand nodes involved, as `{ value, red }` pairs

`SnapshotHistory` collects snapshots for a single operation into an ordered
list. The `Controls` component's step buttons (`⏮ ◀ ▶ ⏭`) are wired to
navigate this history — the callbacks are currently stubs in `TreeVisualizer`
pending the animation implementation.

`SnapshotType` extends `RBT/OperationType` with one extra value — `"new"` —
for the moment a node object is first created before insertion.

---

## Supporting files

### `constants.ts`

```typescript
SLOT = 40          // pixels per grid unit — only used for SVG width/height
NODE_RADIUS = 0.55 // 22px / 40px — circle radius for internal nodes
NIL_RADIUS = 0.2   // 8px  / 40px — circle radius for nil sentinels
PADDING = 1        // 40px / 40px — grid units of whitespace around the tree
LEVEL_GAP = 2      // vertical slots between a node and its children (level doubling)
```

### `colors.ts`

A single `colors` object typed `as const`. All color strings live here — no
inline hex values in components. Referenced by `SvgDefs` for gradient stops
and filter flood colors, and by `Edge` and `NodeBody` for stroke and fill.
