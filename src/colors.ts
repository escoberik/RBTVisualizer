function toCssVarName(key: string) {
  return `--color-${key.replace(/([A-Z])/g, (_, c: string) => `-${c.toLowerCase()}`)}`;
}

export const colors = {
  nodeRed:          "#e81010",
  nodeRedHighlight: "#ffa040",
  nodeRedDark:      "#7a0000",
  nodeRedGlow:      "#ff3300",
  nodeBlack:        "#1f2937",
  nodeBlackHighlight: "#4b5563",
  nodeBlackDark:    "#060d14",
  nodeText:         "#ffffff",
  edge:             "#6b7f94",
  edgeHighlight:    "#c8d8e8",
  nil:              "#6b7280",
  nilHighlight:     "#c5cdd8",
  nilDark:          "#374151",
  dropShadow:       "#00000070",
} as const;

export type ColorKey = keyof typeof colors;

/** Inject this into a <style> tag to make all colors available as CSS custom properties. */
export const cssVariablesBlock = `:root {\n${
  Object.entries(colors)
    .map(([k, v]) => `  ${toCssVarName(k)}: ${v};`)
    .join("\n")
}\n}`;
