import { colors as defaultColors } from "./colors";
import { lighten, darken } from "./colorMath";
import type { ThemeProps, NodeColors } from "./types";

export type { ThemeProps, NodeColors };

// ─── Resolvers ───────────────────────────────────────────────────────────────

export function resolveColors(theme?: ThemeProps): NodeColors {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = defaultColors as any as NodeColors;
  const black = theme?.colors?.nodeBlack ?? d.nodeBlack;
  const red = theme?.colors?.nodeRed ?? d.nodeRed;
  const nodeText = theme?.colors?.nodeText ?? d.nodeText;

  return {
    ...d,
    nodeText,
    nodeBlack: black,
    nodeBlackHighlight: lighten(black, 0.3),
    nodeBlackHighlightSpecular: lighten(black, 0.7),
    nodeBlackDark: darken(black, 0.7),
    nodeBlackRing: lighten(black, 0.45),
    nodeRed: red,
    nodeRedHighlight: lighten(red, 0.35),
    nodeRedHighlightSpecular: lighten(red, 0.72),
    nodeRedDark: darken(red, 0.55),
    nodeRedGlow: red,
    nodeRedRing: lighten(red, 0.4),
  };
}

export function buildHostStyle(theme?: ThemeProps): React.CSSProperties {
  if (!theme) return {};

  const style: React.CSSProperties = {};
  if (theme.fontFamily)
    (style as Record<string, string>)["--font-family"] = theme.fontFamily;

  const c = theme.colors;
  if (!c) return style;

  if (c.background)
    (style as Record<string, string>)["--color-bg"] = c.background;
  if (c.text) (style as Record<string, string>)["--color-text"] = c.text;
  if (c.nil) (style as Record<string, string>)["--color-nil"] = c.nil;
  if (c.button?.bg)
    (style as Record<string, string>)["--color-btn-bg"] = c.button.bg;
  if (c.button?.text)
    (style as Record<string, string>)["--color-btn-text"] = c.button.text;
  if (c.button?.disabled) {
    (style as Record<string, string>)["--color-btn-disabled-bg"] =
      c.button.disabled;
    (style as Record<string, string>)["--color-btn-disabled-border"] =
      c.button.disabled;
  }
  if (c.input?.bg)
    (style as Record<string, string>)["--color-input-bg"] = c.input.bg;
  if (c.input?.border)
    (style as Record<string, string>)["--color-input-border"] = c.input.border;
  if (c.input?.text)
    (style as Record<string, string>)["--color-input-text"] = c.input.text;

  return style;
}
