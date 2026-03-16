# Red-Black Tree Visualizer

An interactive step-by-step visualizer for Red-Black Tree operations. Insert, search for, or delete a number, then walk through every comparison, rotation, and recolor the algorithm performs — one frame at a time.

**Live demo:** https://escoberik.github.io/rbtree-visualizer/

---

## Features

- Step through each event: comparisons, rotations, recolors, found/not-found
- Insert, find, or delete a value — all three animate the same traversal steps
- Smooth animations for node movement, color transitions, and edge changes
- Floating node that travels the search path, lands (insert), hovers (find/delete), or fades (not found / deleted)
- Highlight ring on the active node at each step
- Responsive — works on mobile and desktop

## Install

```bash
npm install rbtrees
```

## Usage

```tsx
import { TreeVisualizer } from 'rbtrees'
import 'rbtrees/style.css'

export default function App() {
  return <TreeVisualizer />
}
```

`TreeVisualizer` is a self-contained component — no props required. It manages its own tree state and renders the full interactive UI.

---

## Development

Clone the repo and run the demo app:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/rbtree-visualizer/`.

To build the library:

```bash
npm run build:lib   # outputs to dist/
```

---

## Tech stack

| Tool | Role |
|------|------|
| React 18 | Component model and rendering loop |
| TypeScript | Strict typing throughout |
| Vite | Dev server and production build |
| SVG | All tree graphics — no canvas, no third-party chart library |
