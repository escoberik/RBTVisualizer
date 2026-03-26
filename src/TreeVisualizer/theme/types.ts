/**
 * Theme customization for `TreeVisualizer`.
 *
 * All fields are optional; omitted fields fall back to the default
 * dark theme. Highlight variants, shadows, and glow effects are
 * derived automatically from `nodeBlack` and `nodeRed` via color
 * math — you only need to supply the two base node colors.
 */
export type ThemeProps = {
  /** Font family for all text inside the visualizer. */
  fontFamily?: string;
  colors?: {
    /** Page/canvas background color. */
    background?: string;
    /** General text color (labels, step descriptions). */
    text?: string;
    /** NIL sentinel node fill color. */
    nil?: string;
    /** Base fill color for black nodes. */
    nodeBlack?: string;
    /** Base fill color for red nodes. */
    nodeRed?: string;
    /** Label text color inside nodes. */
    nodeText?: string;
    button?: {
      /** Button background color. */
      bg?: string;
      /** Button label text color. */
      text?: string;
      /** Disabled-state button color. */
      disabled?: string;
    };
    input?: {
      /** Input field background color. */
      bg?: string;
      /** Input field border color. */
      border?: string;
      /** Input field text color. */
      text?: string;
    };
  };
};

export type NodeColors = {
  nodeRed: string;
  nodeRedHighlight: string;
  nodeRedHighlightSpecular: string;
  nodeRedDark: string;
  nodeRedGlow: string;
  nodeRedRing: string;
  nodeBlack: string;
  nodeBlackHighlight: string;
  nodeBlackHighlightSpecular: string;
  nodeBlackDark: string;
  nodeBlackRing: string;
  nodeText: string;
  edge: string;
  edgeHighlight: string;
  dropShadow: string;
};
