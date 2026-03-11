# Layout Grid System

`Layout` is pure computation — it takes a tree of `Node<T>` objects and returns
integer slot coordinates. It has no dependency on any rendering layer,
framework, or UI toolkit. That makes it usable by any consumer: a React
renderer, a terminal printer, a test suite.

---

## What problem does it solve?

When drawing a binary tree, naive approaches either waste a lot of horizontal
space or require complex multi-pass algorithms to compute positions. This grid
system computes tight, aesthetic node positions in two passes:

1. **Bottom-up** — each subtree gets a **grid**, an abstract description of its
   shape. Grids are combined upward as the tree is traversed.
2. **Top-down** — once all grids are built, a single downward pass derives every
   node's absolute position from its grid.

Because the grid uses abstract unit slots rather than pixels, the rendering
layer decides how to interpret them — node size, spacing, aspect ratio — without
touching the layout logic at all.

---

## GridLine

A `GridLine` describes one horizontal level of a subtree's bounding box:

```
|← leftOffset →|←————————— width —————————→|← rightOffset →|
                [node]  ·  [node]  ·  [node]
```

- **leftOffset** — empty slots from the left edge of _this grid's_ bounding box
  to the leftmost node at this level
- **width** — span from the leftmost to the rightmost node, including the nodes
  themselves and any gaps between them
- **rightOffset** — empty slots from the rightmost node to the right edge of
  _this grid's_ bounding box

The total bounding box width is `leftOffset + width + rightOffset`.

> **Local, not absolute.** These offsets are always relative to the grid's own
> bounding box, not the full tree. How absolute positions are computed from
> local grids is covered in the [Computing positions](#computing-positions)
> section below.

---

## Grid

A `Grid` is an ordered list of `GridLine`s, one per level of the subtree.

**Lines are ordered top-down**: `lines[0]` is the root of the subtree being
described, and `lines[last]` is the deepest level (the leaves).

`Grid.width` is `lines[0].length` — the total bounding box width at the root
level. Since all lines in a merged grid share the same total length (ensured by
the padding in [Step 2](#step-2--pad-narrower-lines-to-the-base-width)), any
line would give the same answer, but `lines[0]` is the natural choice for a
top-down data structure.

---

## Base case: the sentinel

Every sentinel (NIL) node gets a single-line grid with no offsets and a width of
1:

```
GridLine: [leftOffset=0, width=1, rightOffset=0]

Bounding box: |N|
```

All sentinels share the same `Grid.LEAF` constant — no allocation per call.

---

## Merging two grids of equal height

This is the core operation. Given the grids of a node's left and right subtrees
(both the same height), the merge produces the parent's grid in three steps.

### Step 1 — Merge line by line

Each pair of lines at the same depth is concatenated. Concatenation keeps the
left line's `leftOffset`, the right line's `rightOffset`, and inserts a
mandatory gap of 1 between the two widths:

```
left line:  [lL, wL, rL]
right line: [lR, wR, rR]
result:     [lL, wL + 1 + wR, rR]
```

The deepest level of each subtree is concatenated first, forming the **base
line**. Its length defines the total bounding box width for the entire merged
grid.

### Step 2 — Pad narrower lines to the base width

Lines higher up in the subtrees can be narrower than the base line (because
deeper levels tend to spread wider). Any merged line that falls short of the
base width gets its `width` expanded to compensate. Only `width` changes —
`leftOffset` and `rightOffset` are left untouched, so the outer framing stays
consistent and the nodes at that level are pushed apart.

```
base line:          |·  ·  ·  ·  ·  ·  ·|   (7 slots)
shallower merged:   |·  ·  ·  ·  ·|         (5 slots → padded to 7, width grows from 3 to 5)
```

### Step 3 — Place the parent node

A new line is prepended at the top for the parent node itself. It is centered
over the merged bounding box:

```
tip = total length of the shallowest merged line

if tip is odd  → parent goes at (tip - 1) / 2  (perfectly centered)
if tip is even → parent is shifted one slot away from the wider subtree,
                 giving it more breathing room
```

The even-tip shift is a deliberate aesthetic choice: when two subtrees can't
share a perfect center, the parent moves slightly toward the narrower side,
leaving more space for the more crowded one.

---

### Example 1: root with two sentinel children

Left and right subtrees are both single sentinel grids:

```
Left:  lines[0] = [0, 1, 0]
Right: lines[0] = [0, 1, 0]
```

**Step 1** — base line (the only line in each grid):

```
[0,1,0].concat([0,1,0])  →  [0,  1+1+1,  0]  =  [0, 3, 0]
```

**Step 2** — no deeper lines exist, nothing to pad.

**Step 3** — tip = 3 (odd), parent centered at (3−1)/2 = 1:

```
new line: [1, 1, 1]
```

**Result:**

```
lines[0]: [1, 1, 1]   ← parent level
lines[1]: [0, 3, 0]   ← children level
```

Visualized over slot positions 0–2:

```
slot:   0     1     2
             [R]          ← lines[0]
       [N]         [N]    ← lines[1]
```

---

### Example 2: root with two internal nodes, each with two sentinel children

Each internal node A and B has already been merged with its two sentinel
children (using Example 1), giving both the same grid:

```
A and B (identical grids):
  lines[0] = [1, 1, 1]   ← the internal node itself
  lines[1] = [0, 3, 0]   ← two sentinels
```

Now merge A and B to produce the root's grid (equal height, both 2 lines):

**Step 1** — merge deepest lines first:

```
deepest: [0,3,0].concat([0,3,0])  →  [0,  3+1+3,  0]  =  [0, 7, 0]   ← base line (length 7)
next up: [1,1,1].concat([1,1,1])  →  [1,  1+1+1,  1]  =  [1, 3, 1]   (length 5)
```

**Step 2** — the shallower line is only 5 slots wide, base is 7 → pad width by
2:

```
[1, 3, 1]  →  [1, 5, 1]
```

**Step 3** — tip = 7 (odd), parent centered at (7−1)/2 = 3:

```
new line: [3, 1, 3]
```

**Result:**

```
lines[0]: [3, 1, 3]   ← root, perfectly centered
lines[1]: [1, 5, 1]   ← A and B, pushed apart by padding
lines[2]: [0, 7, 0]   ← four sentinels
```

Visualized over slot positions 0–6:

```
slot:   0     1     2     3     4     5     6
                         [R]                      ← lines[0]
             [A]                     [B]          ← lines[1]
       [N]         [N]         [N]         [N]    ← lines[2]
```

The tree this represents:

```
         R
        / \
       A   B
      / \ / \
      N N N N
```

R is perfectly centered at slot 3, equidistant from A (slot 1) and B (slot 5).

---

## Merging grids of unequal height

When one subtree is deeper than the other, a direct line-by-line merge isn't
possible. The algorithm handles this by splitting the taller grid into two
parts:

- **diff** — the extra lines at the deeper end (the levels the shorter subtree
  doesn't reach)
- **matching** — the top portion of the taller grid, trimmed to the same height
  as the shorter subtree

The `matching` portion is merged with the shorter subtree using the equal-height
algorithm above. Then `diff` is appended back at the deeper end, with each of
its lines padded on the outer side to match the total bounding box width of the
merged result.

---

### Example 3: left subtree has depth 2, right subtree has depth 1

```
Left:  lines[0] = [1, 1, 1]   ← A
       lines[1] = [0, 3, 0]   ← A's two sentinel children

Right: lines[0] = [0, 1, 0]   ← B
```

**Split** left to match right's height (1):

```
matching: [[1, 1, 1]]   ← top portion, same height as right
diff:     [[0, 3, 0]]   ← the deeper level, set aside
```

**Merge** matching with right (equal height):

```
Step 1 — base line (only line in each):
  [1,1,1].concat([0,1,0])  →  [1,  1+1+1,  0]  =  [1, 3, 0]   (length 4)

Step 2 — only one line, nothing to pad.

Step 3 — tip = 4 (even), left is wider (3 > 1):
  parent shifts right, giving more breathing room to the wider left subtree
  new line: [2, 1, 1]

Intermediate result:
  lines[0]: [2, 1, 1]
  lines[1]: [1, 3, 0]
```

**Append diff** to the deeper end (total width is now 4, diff line is 3 wide →
pad rightOffset by 1):

```
[0, 3, 0]  →  [0, 3, 1]
```

**Final grid:**

```
lines[0]: [2, 1, 1]   ← R (overall root)
lines[1]: [1, 3, 0]   ← A and B
lines[2]: [0, 3, 1]   ← A's sentinel children; B doesn't reach this depth
```

Visualized over slot positions 0–3:

```
slot:   0     1     2     3
                   [R]         ← lines[0]
             [A]         [B]   ← lines[1]
       [N]         [N]    ·    ← lines[2]: B doesn't reach this depth
```

The tree this represents:

```
        R
       / \
       A   B
      / \
      N   N
```

R sits at slot 2, equidistant from A (slot 1) and B (slot 3). The bounding box
shift gives the wider left subtree one extra slot of breathing room on the left
(leftOffset = 2) at the cost of one slot on the right (rightOffset = 1).

> **Space efficiency.** Compare this to
> [Example 2](#example-2-root-with-two-internal-nodes-each-with-two-sentinel-children)
> (two internal nodes, two sentinels each), which needed 7 slots. Here B has no
> children, so there is nothing below it at depth 2. The algorithm reclaims that
> empty space: rather than reserving room that will never be used, it only
> allocates the minimum width the structure requires — 4 slots instead of 7. The
> gap between A and B is kept as tight as the tree allows.

---

## Computing positions

Once all grids are built, a top-down pass derives each node's absolute slot
coordinate. The key insight comes from a structural invariant of the merge
operation.

### The edge invariant

Look at the concat formula: `[lL, wL+1+wR, rR]`. The merged line inherits its
`leftOffset` from the left subtree and its `rightOffset` from the right subtree.
This means:

- The **left subtree's bounding box is flush with the left edge** of the merged
  result.
- The **right subtree's bounding box is flush with the right edge** of the
  merged result.

This holds at every level, including after padding (`appendLeft`/`appendRight`
preserve the respective outer edge). So as you walk down the tree:

- When you take a **left branch**, the child's bounding box shares its left edge
  with the parent's.
- When you take a **right branch**, the child's bounding box shares its right
  edge with the parent's.

### Two traversal functions

This invariant eliminates the need to compute any explicit child offset.
Instead, two functions each carry the one edge they know:

**`buildPositionsForLeftNode(node, leftEdge, level)`** — called when the node's
bounding box left edge is known:

```
rightEdge = leftEdge + grid.width
position  = leftEdge + lines[0].leftOffset

left child  → buildPositionsForLeftNode(left,  leftEdge,  level + 1)
right child → buildPositionsForRightNode(right, rightEdge, level + 1)
```

**`buildPositionsForRightNode(node, rightEdge, level)`** — called when the
node's bounding box right edge is known:

```
leftEdge  = rightEdge - grid.width
position  = leftEdge + lines[0].leftOffset

left child  → buildPositionsForLeftNode(left,  leftEdge,  level + 1)
right child → buildPositionsForRightNode(right, rightEdge, level + 1)
```

The root always starts as a left-edge node with `leftEdge = 0`.

### Verified against Example 3

```
buildPositionsForLeftNode(R, leftEdge=0, level=0)
  R.grid.width = 4  →  rightEdge = 4
  R.position   = 0 + lines[0].leftOffset = 0 + 2 = slot 2  ✓

  buildPositionsForLeftNode(A, leftEdge=0, level=1)
    A.grid.width = 3  →  rightEdge = 3
    A.position   = 0 + 1 = slot 1  ✓

  buildPositionsForRightNode(B, rightEdge=4, level=1)
    B.grid.width = 1  →  leftEdge = 3
    B.position   = 3 + 0 = slot 3  ✓
```

### What gets stored

The `grids` map is construction-time scaffolding — it exists only for the
duration of the two build passes and is discarded afterward. What survives is:

- **`size`** — the root grid's `{ width, height }`, extracted before `grids` is
  discarded
- **`positions`** — a map from every internal `Node<T>` to its
  `{ offset, level }`
