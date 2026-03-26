# Red-Black Tree Visualizer

[![CI](https://github.com/escoberik/RBTVisualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/escoberik/RBTVisualizer/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/rbtrees)](https://www.npmjs.com/package/rbtrees)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

An interactive step-by-step visualizer for Red-Black Tree operations. Insert,
search for, or delete a number, then walk through every comparison, rotation,
and recolor the algorithm performs — one frame at a time.

**Live demo:** https://rbtrees-escoberik.vercel.app

---

## Features

- Step through each event: comparisons, rotations, recolors, found/not-found
- Insert, find, or delete a value — all three animate the same traversal steps
- Smooth animations for node movement, color transitions, and edge changes
- Floating node that travels the search path, lands on insert, or fades on
  delete
- Highlight ring on the active node at each step
- CSS isolation via Shadow DOM — host-page styles cannot bleed in
- Fully themeable via `ThemeProps` (colors and font family)
- Seed the initial tree with a fixed value list or a random count
- Responsive — works on mobile and desktop

---

## Install

```bash
npm install rbtrees
```

No CSS import needed — styles are self-contained inside the Shadow DOM.

---

## Usage

```tsx
import { TreeVisualizer } from 'rbtrees'

// Empty tree, default theme
export default function App() {
  return <TreeVisualizer />
}
```

### Pre-seeded tree

```tsx
// Fixed values
<TreeVisualizer initialValues={[15, 8, 22, 4, 11]} />

// Random values
<TreeVisualizer initialRandomCount={10} />
```

### Custom theme

```tsx
import { TreeVisualizer } from 'rbtrees'
import type { ThemeProps } from 'rbtrees'

const theme: ThemeProps = {
  fontFamily: 'monospace',
  colors: {
    background: '#0d0d1a',
    text: '#00fff5',
    nodeBlack: '#1a0a2e',
    nodeRed: '#ff007f',
    nodeText: '#ffffff',
    button: { bg: '#ff007f', text: '#0d0d1a', disabled: '#2a2a4a' },
    input: { bg: '#0d0d1a', border: '#00fff5', text: '#00fff5' },
  },
}

export default function App() {
  return <TreeVisualizer theme={theme} />
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `ThemeProps` | — | Custom colors and font family |
| `initialValues` | `number[]` | — | Pre-insert these values on mount |
| `initialRandomCount` | `number` | — | Pre-insert this many random values (1–99) on mount |
| `min` | `number` | `-9999` | Minimum accepted node value |
| `max` | `number` | `99999` | Maximum accepted node value |

If both `initialValues` and `initialRandomCount` are provided,
`initialValues` wins.

Node values must be integers. The default range is **−9999 to 99999**
— a visual constraint, not an algorithmic one (the node circle fits
~5 characters). Pass `min`/`max` to override.

### ThemeProps

All fields are optional. Omitted fields fall back to the default theme.

```ts
type ThemeProps = {
  fontFamily?: string
  colors?: {
    background?: string
    text?: string
    nil?: string        // NIL sentinel node color
    nodeBlack?: string  // base color for black nodes
    nodeRed?: string    // base color for red nodes
    nodeText?: string   // label text inside nodes
    button?: { bg?: string; text?: string; disabled?: string }
    input?:  { bg?: string; border?: string; text?: string }
  }
}
```

Highlight variants, shadows, and glow effects are derived automatically from
`nodeBlack` and `nodeRed` using color math.

---

## Keyboard shortcuts

Click the visualizer to focus it, then:

| Key | Action |
|-----|--------|
| `Enter` | Insert the entered value |
| `f` | Find the entered value |
| `Delete` | Delete the entered value |
| `←` `→` | Step backward / forward |
| `r` | Reset (clear the tree) |

---

## Development

```bash
npm install
npm run dev       # demo app at http://localhost:5173/
npm run build:lib # library build → dist/
```

---

## Tech stack

| Tool | Role |
|------|------|
| React 18 | Component model and rendering loop |
| TypeScript | Strict typing throughout |
| Vite | Dev server and production build |
| SVG | All tree graphics — no canvas, no third-party chart library |
| Shadow DOM | CSS isolation — host-page styles cannot reach inside |
