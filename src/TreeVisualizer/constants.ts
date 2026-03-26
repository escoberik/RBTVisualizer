export const SLOT = 40;          // pixels per grid unit — only used for SVG width/height
export const NODE_RADIUS = 0.55; // 22px / 40px
export const PADDING = 2;        // 80px / 40px
export const LEVEL_GAP = 2;      // vertical slots between a node and its children (level doubling)

// Node label bounds — visually constrained, not algorithmic. The node
// circle fits ~5 characters at the current font size: "99999" and
// "-9999" both fit; a sixth character overflows the circle.
export const VALUE_MIN = -9999;
export const VALUE_MAX = 99999;
