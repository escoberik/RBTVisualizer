import "./App.css";
import TreeVisualizer from "./TreeVisualizer/ShadowHost";
import type { ThemeProps } from "./TreeVisualizer/theme";

const themes: Record<string, ThemeProps> = {
  cyberpunk: {
    fontFamily: "monospace",
    colors: {
      background: "#0d0d1a",
      text: "#00fff5",
      nil: "#2a2a4a",
      nodeBlack: "#1a0a2e",
      nodeRed: "#ff007f",
      nodeText: "#ffffff",
      button: { bg: "#ff007f", text: "#0d0d1a", disabled: "#2a2a4a" },
      input:  { bg: "#0d0d1a", border: "#00fff5", text: "#00fff5" },
    },
  },

  forest: {
    fontFamily: "Georgia, serif",
    colors: {
      background: "#1a2b1a",
      text: "#c8e6c8",
      nil: "#3a4a3a",
      nodeBlack: "#2d4a2d",
      nodeRed: "#c0392b",
      nodeText: "#f0fff0",
      button: { bg: "#4a7c4a", text: "#f0fff0", disabled: "#3a4a3a" },
      input:  { bg: "#1a2b1a", border: "#4a7c4a", text: "#c8e6c8" },
    },
  },

  ocean: {
    colors: {
      background: "#0a1628",
      text: "#b0d4f1",
      nil: "#1a3a5c",
      nodeBlack: "#0d2b4a",
      nodeRed: "#e74c7a",
      nodeText: "#ffffff",
      button: { bg: "#1a6896", text: "#ffffff", disabled: "#1a3a5c" },
      input:  { bg: "#0a1628", border: "#1a6896", text: "#b0d4f1" },
    },
  },

  sunset: {
    fontFamily: "'Trebuchet MS', sans-serif",
    colors: {
      background: "#1c0a00",
      text: "#ffd4a0",
      nil: "#3d1f00",
      nodeBlack: "#2d1200",
      nodeRed: "#ff6b00",
      nodeText: "#fff5e0",
      button: { bg: "#d94f00", text: "#fff5e0", disabled: "#3d1f00" },
      input:  { bg: "#1c0a00", border: "#d94f00", text: "#ffd4a0" },
    },
  },

  monochrome: {
    fontFamily: "'Arial Narrow', Arial, sans-serif",
    colors: {
      background: "#111111",
      text: "#eeeeee",
      nil: "#333333",
      nodeBlack: "#222222",
      nodeRed: "#777777",
      nodeText: "#ffffff",
      button: { bg: "#444444", text: "#eeeeee", disabled: "#333333" },
      input:  { bg: "#111111", border: "#555555", text: "#eeeeee" },
    },
  },

  candy: {
    fontFamily: "'Comic Sans MS', cursive",
    colors: {
      background: "#fff0f8",
      text: "#7b2d8b",
      nil: "#ddb0e8",
      nodeBlack: "#7b2d8b",
      nodeRed: "#ff4da6",
      nodeText: "#ffffff",
      button: { bg: "#ff4da6", text: "#ffffff", disabled: "#ddb0e8" },
      input:  { bg: "#fff0f8", border: "#ff4da6", text: "#7b2d8b" },
    },
  },
};

export default function App() {
  return (
    <div className="app">
      {/* ============================================================
          CHAOS SANDBOX — regression grid for CSS isolation testing.
          Each zone simulates a different hostile host environment.
          Keep this grid permanently to catch style bleed regressions.
          ============================================================ */}

      <div className="chaos-label">Zone 1 — Nuclear button reset + aggressive typography</div>
      <div className="chaos-zone chaos-zone-1">
        <TreeVisualizer theme={themes.cyberpunk} />
      </div>

      <div className="chaos-label">Zone 2 — Flexbox destruction + hostile inputs + color invasion</div>
      <div className="chaos-zone chaos-zone-2">
        <TreeVisualizer theme={themes.forest} />
        <TreeVisualizer theme={themes.ocean} />
      </div>

      <div className="chaos-label">Zone 3 — Box model chaos + !important bombs</div>
      <div className="chaos-zone chaos-zone-3">
        <TreeVisualizer theme={themes.sunset} />
        <TreeVisualizer theme={themes.monochrome} />
        <TreeVisualizer theme={themes.candy} />
      </div>
    </div>
  );
}
