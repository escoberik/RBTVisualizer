import { useRef, useState } from "react";
import {
  SkipFirstIcon,
  StepBackIcon,
  StepForwardIcon,
  SkipLastIcon,
} from "../icons";

export default function TreeVisualizerControls({
  onInsert,
  onNext,
  onPrev,
  onFirst,
  onLast,
  isFirst,
  isLast,
}: {
  onInsert: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleInsert() {
    const num = Number(value);
    if (value.trim() === "" || isNaN(num)) {
      setInvalid(true);
      return;
    }
    onInsert(num);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <div className="controls">
      <div className="controls-actions">
        <input
          ref={inputRef}
          type="number"
          id="node-value"
          name="node-value"
          placeholder="Value"
          value={value}
          className={invalid ? "invalid" : ""}
          autoFocus
          onChange={(e) => {
            setValue(e.target.value);
            setInvalid(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInsert();
              onLast();
            }
          }}
        />
        <button onClick={handleInsert}>Insert</button>
        <button>Find</button>
        <button>Delete</button>
      </div>
      <div className="controls-nav">
        <button title="First step" onClick={onFirst} disabled={isFirst}>
          <SkipFirstIcon />
        </button>
        <button title="Previous step" onClick={onPrev} disabled={isFirst}>
          <StepBackIcon />
        </button>
        <button title="Next step" onClick={onNext} disabled={isLast}>
          <StepForwardIcon />
        </button>
        <button title="Last step" onClick={onLast} disabled={isLast}>
          <SkipLastIcon />
        </button>
      </div>
    </div>
  );
}
