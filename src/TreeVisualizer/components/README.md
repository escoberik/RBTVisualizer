# components/

SVG primitives for the tree visualization. All geometry is expressed in grid
units (see [`../README.md`](../README.md) for the coordinate system). No
component in this folder has any layout logic — positions are always passed in
from `Renderer`.

---

## `TreeNode`

A thin wrapper that positions a node in the SVG and delegates visual rendering
to `NodeBody`.

```tsx
<g transform={`translate(${offset}, ${level})`} opacity={opacity}>
  <g transform={`scale(${scale})`}>
    <NodeBody value={value} colorT={colorT} highlightT={highlightT} />
  </g>
</g>
```

- The outer `<g>` translates to the node's animated grid position.
- `opacity` is `1` for live nodes, fading to `0` for nodes leaving the tree.
- The inner `<g>` applies a `scale` transform, used to pop new nodes in from
  zero size. The scale origin is the node center (`translate` already positions
  that to the origin of the inner `<g>`'s coordinate system).

`TreeNode` has no knowledge of colors, gradients, or edge geometry.

---

## `NodeBody`

Renders a single tree node: a sphere-like circle with a radial gradient fill, a
drop shadow or glow, an optional highlight ring, and a centered text label.

### Props

```typescript
{ value: number; colorT: number; highlightT: number }
```

- `colorT` — `0` = fully black node, `1` = fully red node. Can be any value
  in between during an animated color transition.
- `highlightT` — `0` = normal appearance, `1` = highlighted (active step).
  Controls the specular highlight intensity and the ring visibility.

### Per-node inline SVG defs

Because `colorT` and `highlightT` change every animation frame, static shared
gradients can't be used. Instead, `NodeBody` defines a `<radialGradient>` and a
`<filter>` inline, keyed to the node's value:

```
#ng-{value}   radialGradient — fill for the node circle
#nf-{value}   filter         — drop shadow / glow
```

SVG IDs are global within the document, so these are accessible from anywhere
in the SVG even though they're defined inside a nested `<g>`.

### Color interpolation

All visual properties are computed by interpolating between their black and red
extremes using `colorT`, and between their normal and highlight extremes using
`highlightT`:

| Property | Black (colorT=0) | Red (colorT=1) |
|----------|-----------------|----------------|
| Gradient stop 0 (specular) | `nodeBlackHighlight` → `nodeBlackHighlightSpecular` | `nodeRedHighlight` → `nodeRedHighlightSpecular` |
| Gradient stop 1 (body) | `nodeBlack` | `nodeRed` |
| Gradient stop 2 (dark edge) | `nodeBlackDark` | `nodeRedDark` |
| Stroke | `nodeBlackDark` | `nodeRedDark` |
| Ring | `nodeBlackRing` | `nodeRedRing` |

The specular stop position also shifts: `55%` at `highlightT = 0`, `45%` at
`highlightT = 1`, tightening the highlight as the ring pulses.

### Shadow → glow transition

The filter transitions smoothly from a dark offset drop-shadow (black node) to
a centered red glow (red node):

| Parameter | Black | Red |
|-----------|-------|-----|
| `floodColor` | `#000000` | `nodeRedGlow` |
| `floodOpacity` | `0.44` | `0.75` |
| `dy` (vertical offset) | `0.05` | `0` |
| `stdDeviation` (blur) | `0.0625` | `0.1` |

### Highlight ring

When `highlightT > 0`, a slightly larger `<circle>` with `fill="none"` is
rendered behind the main circle. Its stroke color interpolates between
`nodeBlackRing` and `nodeRedRing` (tracking `colorT`) and its `opacity`
equals `highlightT` for a smooth fade-in/out. The `nodeHighlightRing` filter
(defined in `SvgDefs`) adds a white outer glow.

### Text centering

The label uses `dy="0.35em"` rather than `dominantBaseline="central"` for
cross-browser compatibility (the latter is unreliable on older iOS Safari).
`0.35em` approximates the half-cap-height of the font at `fontSize = 0.35`,
centering the digit visually over `y = 0`.

---

## `Edge`

Draws an arrow from a parent node's center toward its child. Receives the
vector from parent to child in grid units:

```typescript
{ dx: number; dy: number }
```

The component is rendered inside a `<g>` already translated to the parent's
position, so it always draws from `(0, 0)` toward `(dx, dy)`.

### Geometry

```
parent center (0, 0)
      │
      │  ← line (two overlapping strokes for a glossy look)
      │
      ▼  ← arrowhead tip, placed at NODE_RADIUS from child center
```

**Line endpoint:** the line stops at the base of the arrowhead
(`len - NODE_RADIUS - ARROW_LEN` from the parent), so the shaft doesn't poke
through the arrowhead polygon.

**Arrowhead:** a `<polygon>` computed from the line's unit direction vector
`(ux, uy)` and its perpendicular `(px, py) = (-uy, ux)`:

```
tip    = (ex, ey)                              — NODE_RADIUS from child center
base   = tip - ARROW_LEN × (ux, uy)           — 0.25 units behind tip
left   = base + ARROW_WING × (px, py)          — 0.225 units to the left
right  = base - ARROW_WING × (px, py)          — 0.225 units to the right
indent = tip - 0.175 × (ux, uy)               — hollow notch 0.175 units behind tip

polygon: left → tip → right → indent
```

This matches the geometry of the original SVG `<marker>` it replaced. Using an
inline polygon avoids `markerEnd` rendering failures on mobile browsers, and
also makes vertical edges (dx = 0) visible — SVG filter regions on zero-width
elements are unreliable on some mobile renderers.

### Stroke layers

Two overlapping `<line>` elements give the shaft a glossy look:

| Layer | Color | Width |
|-------|-------|-------|
| Base | `colors.edge` | `0.1` |
| Highlight | `colors.edgeHighlight` | `0.03` (70% opacity) |
