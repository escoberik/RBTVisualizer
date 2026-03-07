import { useState } from "react";
import {
  SkipFirstIcon,
  StepBackIcon,
  StepForwardIcon,
  SkipLastIcon,
} from "./icons";

export default function TreeVisualizerControls({
  onInsert,
  onNext,
  onPrev,
  onFirst,
  onLast,
}: {
  onInsert: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
}) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);

  function handleInsert() {
    const num = Number(value);
    if (value.trim() === "" || isNaN(num)) {
      setInvalid(true);
      return;
    }
    onInsert(num);
    setValue("");
  }

  return (
    <div className="controls">
      <div className="controls-actions">
        <input
          type="number"
          id="node-value"
          name="node-value"
          placeholder="Value"
          value={value}
          className={invalid ? "invalid" : ""}
          onChange={(e) => {
            setValue(e.target.value);
            setInvalid(false);
          }}
        />
        <button onClick={handleInsert}>Insert</button>
        <button>Find</button>
        <button>Delete</button>
      </div>
      <div className="controls-nav">
        <button title="First step" onClick={onFirst}>
          <SkipFirstIcon />
        </button>
        <button title="Previous step" onClick={onPrev}>
          <StepBackIcon />
        </button>
        <button title="Next step" onClick={onNext}>
          <StepForwardIcon />
        </button>
        <button title="Last step" onClick={onLast}>
          <SkipLastIcon />
        </button>
      </div>
    </div>
  );
}
