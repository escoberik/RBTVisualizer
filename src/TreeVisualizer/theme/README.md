# theme/

Everything related to colors and theming. Isolated from rendering and
component logic.

---

## Files

### `types.ts`

Exports two types:

- `ThemeProps` — the public API. What consumers pass into `<TreeVisualizer />`.
  All fields optional.
- `NodeColors` — the internal resolved palette. A flat object of hex strings
  covering every visual variant (highlight, dark, ring, glow) for both black
  and red nodes, plus edges and drop shadows.

### `colors.ts`

Hardcoded default color palette typed `as const`. Every hex color in the
default theme lives here. Used as fallback values in `resolveColors` when no
theme is provided.

### `colorMath.ts`

`Color` class and two exported helpers:

- `new Color(hex)` — parses a hex string into r/g/b
- `color.mix(other, amount)` — linear interpolation between two colors
- `color.hex` — getter, serializes back to hex
- `Color.WHITE`, `Color.BLACK` — shared constants
- `lighten(hex, amount)` — mix toward white
- `darken(hex, amount)` — mix toward black

Used by `theme.ts` to derive the full `NodeColors` palette from two base
colors (`nodeBlack` and `nodeRed`).

### `theme.ts`

Two resolver functions:

- `resolveColors(theme?)` — builds a full `NodeColors` from a `ThemeProps`.
  Derives all highlight, dark, ring, and glow variants mathematically via
  `colorMath`. Falls back to `colors.ts` defaults for anything not specified.
- `buildHostStyle(theme?)` — converts a `ThemeProps` into React inline styles
  that set CSS custom properties on the shadow host element, where the shadow
  stylesheet can read them via `var(--color-*)` and `var(--font-family)`.

### `ColorsContext.ts`

React context (`ColorsContext`) and `useColors()` hook. `TreeVisualizer`
resolves colors once and provides them here. `NodeBody` consumes them directly
without prop-drilling through `Renderer` and `TreeNode`.

---

## How theming works

CSS custom properties pierce the shadow DOM boundary. `buildHostStyle` sets
`--color-bg`, `--color-btn-bg`, `--font-family`, etc. as inline styles on
the shadow host `<div>`. The shadow stylesheet reads them with `var(--color-*)`.

SVG node colors (gradients, glow effects) are driven by `ColorsContext` because
SVG `<defs>` gradients need JavaScript values — they can't be driven by CSS.
