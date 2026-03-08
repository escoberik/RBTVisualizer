import { useRef, useState } from "react";
import RBTHistory from "../RBT/RBTHistory";
import RBTree from "../RBT/RBTree";
import Controls from "./TreeVisualizerControls";
import Renderer from "./TreeVisualizerRenderer";

function Label({ text }: { text: string }) {
  return <p>{text}</p>;
}

export default function TreeVisualizer() {
  const tree = useRef(new RBTree());
  const history = useRef(new RBTHistory(tree.current.clone(), "start"));
  const [index, setIndex] = useState(0);
  const snapshot = history.current.getSnapshot(index)!;

  function show(i: number) {
    if (history.current.getSnapshot(i)) {
      setIndex(i);
    }
  }

  function handleInsert(num: number) {
    history.current = tree.current.insert(num);
    setIndex(0);
  }

  return (
    <div className="visualizer">
      <Label text={snapshot.description} />
      <Renderer snapshot={snapshot} />
      <Controls
        onInsert={handleInsert}
        onNext={() => show(index + 1)}
        onPrev={() => show(index - 1)}
        onFirst={() => show(0)}
        onLast={() => show(history.current.length - 1)}
        isFirst={index === 0}
        isLast={index === history.current.length - 1}
      />
    </div>
  );
}
