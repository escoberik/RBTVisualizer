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
  isEmpty: boolean;
  min: number;
  max: number;
  onValidationError: (message: string | null) => void;
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
  isEmpty,
  min,
  max,
  onValidationError,
}: ControlsProps) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function parseValue(): number | null {
    if (value.trim() === "") {
      setInvalid(true);
      onValidationError("Enter a value");
      return null;
    }
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) {
      setInvalid(true);
      onValidationError("Whole numbers only");
      return null;
    }
    if (num < min || num > max) {
      setInvalid(true);
      onValidationError(`Must be ${min} – ${max}`);
      return null;
    }
    onValidationError(null);
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
              onValidationError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInsert();
                onLast();
              } else if (e.key === "Delete" && !isEmpty) {
                handleDelete();
                onLast();
              } else if ((e.key === "f" || e.key === "F") && !isEmpty) {
                handleFind();
                onLast();
              }
            }}
          />
        </div>
        <button onClick={handleInsert}>Insert</button>
        <button onClick={handleFind} disabled={isEmpty}>Find</button>
        <button onClick={handleDelete} disabled={isEmpty}>Delete</button>
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
