# TreeVisualizer

The rendering and animation layer for the Red-Black Tree visualizer. Takes the
pure-math output of `RBT/` and turns it into an interactive, animated SVG. Each
layer in this pipeline knows as little as possible about the layers below it.

---

## Pipeline overview

```
RBT/Tree  ──(LogFn)──→  History  ──→  Snapshot  ──→  useLayoutTransition  ──→  Renderer  ──→  SVG
            events        snapshots        positions            animated positions
```

1. `RBT/Tree` mutates itself and fires events through the `LogFn` callback.
2. `History` catches those events, wraps each in a `Snapshot` snapshot,
   and stores the sequence.
3. `TreeVisualizer` (the root component) navigates `History` by index.
4. `useLayoutTransition` interpolates between the current and previous
   `Snapshot` over 1 second using `requestAnimationFrame`.
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
fraction of one grid unit. `NODE_RADIUS = 0.55` means 22px at the default
scale. Changing `SLOT` rescales the entire visualization uniformly.

### Level doubling

`RBT/Layout` assigns each node an integer `level` starting at 0. Adjacent
levels are 1 unit apart — not enough vertical space for arrow glyphs.
`Snapshot` doubles all levels before storing them:

```
RBT level:  0  1  2  3  …
TV level:   0  2  4  6  …
```

Nodes land on even slots; the odd slots between them hold the arrows.
`LEVEL_GAP = 2` records this vertical distance between parent and child.

---

## Files

### `ShadowHost.tsx` — public entry point

The component exported as `TreeVisualizer` from the package. Creates a shadow
root on a host `<div>`, injects the stylesheet into it, and portals
`TreeVisualizer` inside. This gives the component full CSS isolation — no
host-page styles can reach in.

Theme CSS custom properties are set as inline styles on the host element via
`buildHostStyle`, where they pierce the shadow boundary and are picked up by
the shadow stylesheet.

### `TreeVisualizer.tsx` — root component

Owns the `Tree` and `History` instances in a stable ref (never recreated on
re-render). Accepts an optional seed via `initialValues` or `initialRandomCount`
to populate the tree on mount. All three operations follow the same pattern:

**Insert:**
1. `history.reset(tree.root, value, "insert")` — snapshot before-state
2. `tree.insert(value)` — fires events through `history.append`
3. Reset step index to 0

**Find:**
1. `history.reset(tree.root, value, "find")` — floating value is the target
2. `tree.find(value)` — fires traversal and terminal events
3. If tree is empty, `history.appendFinal("Not found", tree.root)`
4. Reset step index to 0

**Delete:**
1. `history.reset(tree.root, value, "delete")` — floating value is the target
2. `tree.delete(value)` — fires traversal + delete-specific events
3. If tree is empty, `history.appendFinal("Not found", tree.root)`
4. Reset step index to 0

Step navigation (first / prev / next / last) moves the index through
`history`'s snapshot array.

### `History.ts` — snapshot collector

`History<T>` receives `(event, root, subject)` callbacks from `RBT/Tree` and
stores each as a `Layout<T>` with a human-readable description. It also tracks
`_floatingValue` — the active value (being inserted, searched, or deleted) —
and injects it into `Layout` so the floating node animation knows which node
to float.

`History` uses a `LayoutEventType` which is a superset of the RBT core's
`EventType`. This lets the visualizer layer introduce or translate events
without touching the core:

- `INITIAL` — the before-state snapshot created by `reset()`
- `FOUND_DUPLICATE` — translated from `FOUND` when `_mode === "insert"`, so
  inserting a duplicate shows a distinct description from a plain find

`_mode` (`"insert" | "find" | "delete"`) drives this translation. A `FOUND`
during delete stays as `FOUND`; only the insert path translates it.

The floating node is shown (`showFloating = true`) during steps where the
active value is still in play: `COMPARE_LEFT`, `COMPARE_RIGHT`, `FOUND`,
`FOUND_DUPLICATE`, and `REPLACE_WITH_SUCCESSOR`. It is hidden for all
structural/recolor steps and for `DELETE`, so the floating ghost and the
deleted node fade out together.

A stable `size` property tracks the maximum `{ width, height }` seen across
all snapshots. `Renderer` uses this to keep the SVG viewport constant while
stepping through history, preventing layout jumps as the tree grows.

### `Controls.tsx` — action bar

Input + Insert/Find/Delete buttons + step navigation. Fully controlled — all
state lives in `TreeVisualizer`. Keyboard shortcuts: `Enter` = insert,
`Delete` = delete, `f`/`F` = find.

### `constants.ts`

```typescript
SLOT        = 40    // px per grid unit — only used for SVG width
NODE_RADIUS = 0.55  // 22px — circle radius for internal nodes
PADDING     = 2     // 80px — grid units of whitespace around the tree
LEVEL_GAP   = 2     // vertical distance from a node to its children
```

---

## Subfolders

- [`theme/`](theme/README.md) — color math, theming types, CSS var bridge,
  and the `ColorsContext` used by `NodeBody`
- [`rendering/`](rendering/README.md) — Layout adapter, animation hook,
  Renderer, SvgDefs, and the node/edge components
