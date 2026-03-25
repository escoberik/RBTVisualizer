import { useRef, useState } from "react";
import {
  SkipFirstIcon,
  StepBackIcon,
  StepForwardIcon,
  SkipLastIcon,
} from "../icons";

type ControlsProps = {
  onInsert: (value: number) => void;
  onFind: (value: number) => void;
  onDelete: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export default function Controls({
  onInsert,
  onFind,
  onDelete,
  onNext,
  onPrev,
  onFirst,
  onLast,
  isFirst,
  isLast,
}: ControlsProps) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function parseValue(): number | null {
    const num = Number(value);
    if (value.trim() === "" || isNaN(num) || num > 99999) {
      setInvalid(true);
      return null;
    }
    return num;
  }

  function handleInsert() {
    const num = parseValue();
    if (num === null) return;
    onInsert(num);
    setValue("");
    inputRef.current?.focus();
  }

  function handleFind() {
    const num = parseValue();
    if (num === null) return;
    onFind(num);
    setValue("");
    inputRef.current?.focus();
  }

  function handleDelete() {
    const num = parseValue();
    if (num === null) return;
    onDelete(num);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <div className="controls">
      <div className="controls-actions">
        <div className="controls-input-wrapper">
          <input
            ref={inputRef}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInsert();
                onLast();
              } else if (e.key === "Delete") {
                handleDelete();
                onLast();
              } else if (e.key === "f" || e.key === "F") {
                handleFind();
                onLast();
              }
            }}
          />
        </div>
        <button onClick={handleInsert}>Insert</button>
        <button onClick={handleFind}>Find</button>
        <button onClick={handleDelete}>Delete</button>
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
