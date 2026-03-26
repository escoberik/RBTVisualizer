import styleText from "./style.css?inline";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import TreeVisualizer from "./TreeVisualizer";
import { type ThemeProps, buildHostStyle } from "./theme";

/**
 * Interactive step-by-step Red-Black Tree visualizer.
 *
 * Renders inside a Shadow DOM so host-page styles cannot bleed in.
 * No CSS import is needed — all styles are self-contained.
 *
 * @param theme        Optional color and font overrides. See
 *                     {@link ThemeProps} for the full schema.
 * @param initialValues  Pre-insert these values on mount.
 *                       If both props are given, this one wins.
 * @param initialRandomCount  Pre-insert this many random values
 *                            (1–99) from the range 1–99999 on mount.
 */
export default function ShadowHost({
  theme,
  initialValues,
  initialRandomCount,
}: {
  theme?: ThemeProps;
  initialValues?: number[];
  initialRandomCount?: number;
} = {}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;

    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.appendChild(style);

    const div = document.createElement("div");
    shadow.appendChild(div);
    setContainer(div);
  }, []);

  return (
    <div ref={hostRef} style={buildHostStyle(theme)}>
      {container && createPortal(
        <TreeVisualizer
          theme={theme}
          initialValues={initialValues}
          initialRandomCount={initialRandomCount}
        />,
        container,
      )}
    </div>
  );
}
