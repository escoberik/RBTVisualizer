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
  const [step, setStep] = useState(0);
  const [snapshot, setSnapshot] = useState(() => history.current.getSnapshot(0)!);

  function show(i: number) {
    const s = history.current.getSnapshot(i);
    if (s) {
      setStep(i);
      setSnapshot(s);
    }
  }

  function handleInsert(num: number) {
    history.current = tree.current.insert(num);
    setStep(0);
    setSnapshot(history.current.getSnapshot(0)!);
  }

  return (
    <div className="visualizer">
      <Label text={snapshot.description} />
      <Renderer snapshot={snapshot} />
      <Controls
        onInsert={handleInsert}
        onNext={() => show(step + 1)}
        onPrev={() => show(step - 1)}
        onFirst={() => show(0)}
        onLast={() => show(history.current.length - 1)}
        isFirst={step === 0}
        isLast={step === history.current.length - 1}
      />
    </div>
  );
}
