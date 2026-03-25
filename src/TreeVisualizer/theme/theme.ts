import { lighten, darken } from "./colorMath";
import type { ThemeProps, NodeColors } from "./types";

export type { ThemeProps, NodeColors };

// ─── Private seeds ────────────────────────────────────────────────────────────
// resolveColors() falls back to these when the caller omits nodeBlack,
// nodeRed, or nodeText. Keeping them as named constants (rather than
// reading from defaultTheme) avoids non-null assertions on optional fields.

const SEED_BLACK  = "#1f2937";
const SEED_RED    = "#e81010";
const SEED_TEXT   = "#ffffff";
const DROP_SHADOW = "#00000070";

// ─── Public default theme ─────────────────────────────────────────────────────
// All fields are set, so this doubles as self-documentation for what the
// default theme looks like and what values each ThemeProps field accepts.

export const defaultTheme: ThemeProps = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  colors: {
    background: "#21222c",
    text:       "#e2e8f0",
    nil:        "#6b7280",
    nodeBlack:  SEED_BLACK,
    nodeRed:    SEED_RED,
    nodeText:   SEED_TEXT,
    button: { bg: "#2563eb", text: "#ffffff", disabled: "#6b7280" },
    input:  { bg: "#1e1e2e", border: "#44475a", text:   "#e2e8f0" },
  },
};

// ─── Resolvers ────────────────────────────────────────────────────────────────

export function resolveColors(theme?: ThemeProps): NodeColors {
  const black    = theme?.colors?.nodeBlack ?? SEED_BLACK;
  const red      = theme?.colors?.nodeRed   ?? SEED_RED;
  const nodeText = theme?.colors?.nodeText  ?? SEED_TEXT;

  return {
    nodeBlack:                  black,
    nodeBlackHighlight:         lighten(black, 0.3),
    nodeBlackHighlightSpecular: lighten(black, 0.7),
    nodeBlackDark:              darken(black,  0.7),
    nodeBlackRing:              lighten(black, 0.45),
    nodeRed:                    red,
    nodeRedHighlight:           lighten(red,   0.35),
    nodeRedHighlightSpecular:   lighten(red,   0.72),
    nodeRedDark:                darken(red,    0.55),
    nodeRedGlow:                red,
    nodeRedRing:                lighten(red,   0.4),
    nodeText,
    edge:                       lighten(black, 0.35),
    edgeHighlight:              lighten(black, 0.75),
    dropShadow:                 DROP_SHADOW,
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
  if (c.text)
    (style as Record<string, string>)["--color-text"] = c.text;
  if (c.nil)
    (style as Record<string, string>)["--color-nil"] = c.nil;
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
