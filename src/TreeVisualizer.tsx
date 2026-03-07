import { useState } from "react";
import RBTree from "./RBT/RBTree";
import RBTreeSnapshot from "./RBT/RBTreeSnapshot";
import RBTHistory from "./RBT/RBTHistory";
import {
  SkipFirstIcon,
  StepBackIcon,
  StepForwardIcon,
  SkipLastIcon,
} from "./icons";

const NIL_RADIUS = 8;
const NODE_RADIUS = NIL_RADIUS * 3;
const PADDING = 25;

function NilNode({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={NIL_RADIUS} fill="#6b7280" />;
}

function TreeNode({ x, y, value }: { x: number; y: number; value: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={NODE_RADIUS} fill="#ef4444" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    </g>
  );
}

function TreeRenderer({ history }: { history: RBTHistory }) {
  const contentWidth = NIL_RADIUS * 2;
  const contentHeight = NIL_RADIUS * 2;
  const width = contentWidth + PADDING * 2;
  const height = contentHeight + PADDING * 2;
  const cx = PADDING + NIL_RADIUS;
  const cy = PADDING + NIL_RADIUS;

  const snapshot = history.snapshots[history.snapshots.length - 1];
  return (
    <svg
      width={width}
      height={height}
      style={{ display: "block", margin: "0 auto" }}
    >
      {snapshot.tree.root ? (
        <TreeNode x={cx} y={cy} value={snapshot.tree.root.value} />
      ) : (
        <NilNode x={cx} y={cy} />
      )}
    </svg>
  );
}

function Controls({ onInsert }: { onInsert: (value: number) => void }) {
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
        <button title="First step">
          <SkipFirstIcon />
        </button>
        <button title="Previous step">
          <StepBackIcon />
        </button>
        <button title="Next step">
          <StepForwardIcon />
        </button>
        <button title="Last step">
          <SkipLastIcon />
        </button>
      </div>
    </div>
  );
}

export default function TreeVisualizer() {
  const tree = new RBTree();
  const [history, setHistory] = useState<RBTHistory>(
    new RBTHistory(tree.clone(), "Initial empty tree"),
  );

  function handleInsert(num: number) {
    setHistory(tree.insert(num));
  }

  return (
    <div className="visualizer">
      <TreeRenderer history={history} />
      <Controls onInsert={handleInsert} />
    </div>
  );
}
