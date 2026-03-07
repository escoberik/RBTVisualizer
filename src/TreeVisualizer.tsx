import { useRef, useState } from "react";
import RBTSnapshot from "./RBT/RBTSnapshot";
import RBTHistory from "./RBT/RBTHistory";
import RBTree from "./RBT/RBTree";
import Controls from "./TreeVisualizerControls";
import Renderer from "./TreeVisualizerRenderer";

function Label({ text }: { text: string }) {
  return <p>{text}</p>;
}

export default function TreeVisualizer() {
  const tree = useRef(new RBTree());
  const history = useRef(
    new RBTHistory(tree.current.clone(), "Initial empty tree"),
  );
  const index = useRef(0);
  const [snapshot, setSnapshot] = useState<RBTSnapshot>(
    history.current.getSnapshot(0)!,
  );

  function show(i: number) {
    const s = history.current.getSnapshot(i);
    if (s) {
      index.current = i;
      setSnapshot(s);
    }
  }

  function handleInsert(num: number) {
    history.current = tree.current.insert(num);
    show(0);
  }

  function moveForward() {
    show(index.current + 1);
  }
  function moveBack() {
    show(index.current - 1);
  }
  function moveFirst() {
    show(0);
  }
  function moveLast() {
    show(history.current.length - 1);
  }

  return (
    <div className="visualizer">
      <Label text={snapshot.description} />
      <Renderer tree={snapshot.tree} />
      <Controls
        onInsert={handleInsert}
        onNext={moveForward}
        onPrev={moveBack}
        onFirst={moveFirst}
        onLast={moveLast}
      />
    </div>
  );
}
