import styleText from "./style.css?inline";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import TreeVisualizer from "./TreeVisualizer";
import { type ThemeProps, buildHostStyle } from "./theme";

export default function ShadowHost({ theme }: { theme?: ThemeProps } = {}) {
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
      {container && createPortal(<TreeVisualizer theme={theme} />, container)}
    </div>
  );
}
