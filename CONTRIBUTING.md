# Contributing

This document is for developers who want to understand, extend, or
evaluate the codebase. It covers architecture, key design decisions,
and how to run the project locally.

---

## Architecture overview

The codebase is split into two layers with a strict dependency rule:
**the algorithm layer has no knowledge of React or the DOM.**

```
src/
  RBT/               Pure TypeScript — algorithm, layout math
  TreeVisualizer/    React — rendering, animation, controls, theming
  App.tsx            Dev/demo app (not part of the published package)
  index.ts           Package entry point
```

Data flows in one direction through a pipeline:

```
Tree<T>                 fires LogFn events during operations
  └─ History<T>         captures each event as a Layout<T> snapshot
       └─ Layout<T>     computes node positions + floating node
            └─ useLayoutTransition   interpolates between layouts
                 └─ Renderer         draws the SVG
```

The entry point for npm consumers is `ShadowHost`, which wraps
`TreeVisualizer` in a Shadow DOM to prevent host-page styles from
leaking in.

---

## RBT algorithm (`src/RBT/`)

### Node hierarchy

```
Node<T>           abstract base — left/right/parent, isNil, isRed,
                  sibling, uncle (derived)
  InternalNode<T> concrete node with a value and a mutable color
  SentinelNode<T> the NIL leaf — singleton, always black, all
                  pointers self-referential
```

The sentinel singleton eliminates null checks throughout the
algorithm. Every leaf pointer is the same NIL object, so structural
tests (`node.isNil`, `node.left.isNil`) are always safe to call
without guarding.

### Event system

`Tree<T>` accepts an optional `LogFn<Node<T>>` at construction time:

```ts
type LogFn<T> = (event: EventType, root: T, subject: T) => void
```

The algorithm calls this at every meaningful step — comparisons,
rotations, recolors, inserts, deletes — but knows nothing about what
the caller does with the events. This is the seam between the pure
algorithm and the visualization layer.

`EventType` is a string union (not an enum), which makes it a
compile-time contract: adding a new event type forces every switch
statement and `Record<EventType, …>` to be updated.

### Insert fixup

After a standard BST insert, `fixInsert` restores red-black
properties. It covers four cases:

| Case | Condition | Fix |
|------|-----------|-----|
| 1 | Node is root | Done (root is repainted black after fixup) |
| 2 | Parent is black | Done |
| 3 | Uncle is red | Recolor parent + uncle black, grandparent red, recurse |
| 4a | Parent left, node right (LR) | Left-rotate parent → fall to 4b |
| 4b | Parent left, node left (LL) | Right-rotate grandparent, recolor |
| 4c/4d | Mirror of 4a/4b for right parent | Same, mirrored |

### Delete fixup

`deleteNode` handles three structural cases (0, 1, or 2 children).
For a 2-child node, the in-order successor is spliced in. If the
removed node was black, `fixDelete` is called to restore the
black-height invariant.

`fixDelete` tracks `xParent` explicitly (rather than via
`x.parent`) because `x` can be the NIL sentinel — whose `parent`
pointer is always self — so the parent must be passed separately.

The four fix cases (each mirrored for left/right):

| Case | Condition | Fix |
|------|-----------|-----|
| 1 | Sibling is red | Recolor + rotate to convert to case 2/3/4 |
| 2 | Sibling has two black children | Recolor sibling red, propagate up |
| 3 | Sibling's near child red, far black | Recolor + rotate → case 4 |
| 4 | Sibling's far child red | Rotate + recolor, done |

### Grid layout (`Grid.ts`, `Layout.ts`)

Node positions are computed in two passes:

1. **Bottom-up (`buildGrid`):** Each subtree gets a `Grid` — a list
   of `GridLine`s (one per level) describing the horizontal span of
   that subtree. `Grid.merge` combines two child grids by aligning
   their deepest levels, then placing the parent one slot above the
   combined base. The parent nudges toward the wider subtree when the
   grid width is even.

2. **Top-down (`buildPositions`):** Starting from the root at offset
   0, each node's absolute position is derived from the edge
   invariant: left subtrees are flush-left, right subtrees are
   flush-right within their parent's bounding box.

The grid uses integer slot units; `SLOT = 40px` converts to pixels
only in the SVG renderer.

---

## Step-by-step engine (`src/TreeVisualizer/`)

### History

`History<T>` is the bridge between the algorithm and the renderer.
It holds a `LogFn` that `Tree<T>` calls during an operation, and
converts each event into a `Layout<T>` snapshot:

```
history.reset(root, value, mode)  →  clears layouts, records initial state
tree.insert(value)                →  fires events → History.append() per event
history.appendFinal(desc, root)   →  records the terminal state
```

Each snapshot captures the full tree structure at that moment, the
highlighted node, and the floating node (the search cursor). The
viewport size is the maximum width and height across all snapshots in
the session, so the SVG canvas never shrinks mid-replay.

`LayoutEventType` is a superset of `RBTEventType`. The one
translation that happens here: a `FOUND` event during an insert
operation becomes `FOUND_DUPLICATE`, since the algorithm reuses the
same event for both find-hit and duplicate-detection.

### Floating node

The floating node represents the value being operated on. It appears
during comparison and found events, hovering 1.5 grid units above the
highlighted node. On insert it slides down and "lands" on the new
node; on delete it lifts off the successor before it disappears.
Structurally-only events (rotations, recolors) hide the floating node
to keep the focus on the tree changes.

### Animation (`useLayoutTransition`)

`useLayoutTransition` receives a `Layout<T>` snapshot and returns an
`AnimatedLayout<T>` that interpolates between the previous and
current layout over 1 second using a `requestAnimationFrame` loop.

Each node carries four animated scalars:

| Field | Meaning |
|-------|---------|
| `offset`, `level` | position (lerped) |
| `colorT` | 0 = black, 1 = red (lerped) |
| `highlightT` | 0 = normal, 1 = highlighted (lerped) |
| `opacity`, `scale` | for appearing/disappearing nodes |

Edges crossfade: the old topology fades out while the new one fades
in, so rotations read as a smooth structural change rather than a
jump.

### Theming

`ThemeProps` is the public API. `resolveColors` derives a full
`NodeColors` palette from just `nodeBlack` and `nodeRed` using linear
color interpolation (lighten/darken). CSS custom properties on the
shadow host carry the non-node colors (background, text, buttons,
inputs) across the shadow boundary.

---

## Running locally

```bash
npm install
npm run dev        # demo app at http://localhost:5173/
npm test           # run all tests (vitest)
npm run test:watch # watch mode
npm run build:lib  # library build → dist/
```

Tests live in `tests/`, mirroring the `src/` structure:

```
tests/
  RBT/
    Tree.test.ts       RBT algorithm — all operations and edge cases
    Grid.test.ts       Grid layout math
  TreeVisualizer/
    History.test.ts    Step-by-step engine (integration)
```

The demo app (`src/App.tsx`) renders six themed instances inside a
chaos sandbox — three zones of aggressive conflicting CSS — to verify
that Shadow DOM isolation holds under adversarial host styles.

---

## Contribution guidelines

- **Keep the algorithm layer pure.** `src/RBT/` must not import React,
  the DOM, or anything from `src/TreeVisualizer/`. This boundary is
  what makes the algorithm independently testable.
- **Run tests before opening a PR.** `npm test` must pass with no
  failures.
- **Match the existing event contract.** If you add a new `EventType`,
  update `EventDescriptions` in `History.ts` and handle it in any
  `Record<EventType, …>` or switch — the compiler will tell you what
  you missed.
- **Prefer surgical changes.** The grid layout and animation
  interpolation are load-bearing; changes there should come with tests.
- **No console.log in committed code.**
