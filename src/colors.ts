function toCssVarName(key: string) {
  return `--color-${key.replace(/([A-Z])/g, (_, c: string) => `-${c.toLowerCase()}`)}`;
}

export const colors = {
  nodeRed:      "#e81010",
  nodeBlack:    "#1f2937",
  nodeText:     "#ffffff",
  edge:         "#9ca3af",
  nil:          "#6b7280",
  nilHighlight: "#c5cdd8",
  nilDark:      "#374151",
  dropShadow:   "#00000070",
} as const;

export type ColorKey = keyof typeof colors;

/** Inject this into a <style> tag to make all colors available as CSS custom properties. */
export const cssVariablesBlock = `:root {\n${
  Object.entries(colors)
    .map(([k, v]) => `  ${toCssVarName(k)}: ${v};`)
    .join("\n")
}\n}`;
