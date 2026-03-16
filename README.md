# Red-Black Tree Visualizer

An interactive step-by-step visualizer for Red-Black Tree operations. Insert or search for a number, then walk through every comparison, rotation, and recolor the algorithm performs — one frame at a time.

**Live demo:** https://escoberik.github.io/rbtree-visualizer/

---

## Features

- Step through each event: comparisons, rotations, recolors, found/not-found
- Insert a value or search for one — both animate the same traversal steps
- Smooth animations for node movement, color transitions, and edge changes
- Floating node that travels the search path and lands (insert) or vanishes (find)
- Highlight ring on the active node at each step
- Responsive — works on mobile and desktop

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/rbtree-visualizer/`.

To build for production:

```bash
npm run build   # outputs to dist/
```

Deployment to GitHub Pages is handled automatically by `.github/workflows/deploy.yml` on every push to `main`.

---

## Project structure

```
src/
├── RBT/                 # Pure Red-Black Tree implementation (no UI dependency)
│   ├── types.ts         # EventType, LogFn, NodePosition
│   ├── Node.ts          # Abstract base node
│   ├── InternalNode.ts  # Concrete tree node with value and color
│   ├── SentinelNode.ts  # Singleton NIL sentinel
│   ├── Tree.ts          # Insertion and search logic with event callbacks
│   ├── Grid.ts          # Grid/GridLine layout primitives
│   ├── Layout.ts        # Two-pass slot-position computation
│   └── README.md        # Layout algorithm deep-dive
│
└── TreeVisualizer/      # React + SVG rendering layer
    ├── TreeVisualizer.tsx      # Root component, owns Tree and History
    ├── History.ts              # Collects Layout snapshots per insertion
    ├── Layout.ts               # Visualization adapter over RBT/Layout
    ├── Renderer.tsx            # Translates AnimatedLayout → SVG
    ├── useLayoutTransition.ts  # requestAnimationFrame interpolation hook
    ├── Controls.tsx            # Insert input and step navigation buttons
    ├── SvgDefs.tsx             # Shared SVG filter definitions
    ├── colors.ts               # Centralized color palette
    ├── constants.ts            # SLOT, NODE_RADIUS, PADDING, LEVEL_GAP
    ├── README.md               # Rendering pipeline and animation system
    └── components/
        ├── TreeNode.tsx        # Positioned, animated node wrapper
        ├── NodeBody.tsx        # Circle with interpolated gradient and glow
        ├── Edge.tsx            # Arrow with inline arrowhead polygon
        └── README.md           # Component-level SVG details
```

---

## Tech stack

| Tool | Role |
|------|------|
| React 18 | Component model and rendering loop |
| TypeScript | Strict typing throughout |
| Vite | Dev server and production build |
| Pico CSS | Minimal base styles (dark/light mode, form elements) |
| SVG | All tree graphics — no canvas, no third-party chart library |
