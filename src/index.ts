// ShadowHost wraps TreeVisualizer in a shadow DOM for CSS isolation. We export
// it as TreeVisualizer here to keep the public API stable — consumers embed it
// as <TreeVisualizer /> without needing to know about the shadow DOM machinery.
export { default } from "./TreeVisualizer/ShadowHost";
export { default as TreeVisualizer } from "./TreeVisualizer/ShadowHost";
export { defaultTheme } from "./TreeVisualizer/theme";
export type { ThemeProps } from "./TreeVisualizer/theme";
