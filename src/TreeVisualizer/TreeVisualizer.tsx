import useRBTHistory from "./useRBTHistory";
import Controls from "./TreeVisualizerControls";
import Renderer from "./TreeVisualizerRenderer";

function Label({ text }: { text: string }) {
  return <p>{text}</p>;
}

export default function TreeVisualizer() {
  const { snapshot, step, length, navigate, insert } = useRBTHistory();

  return (
    <div className="visualizer">
      <Label text={snapshot.description} />
      <Renderer snapshot={snapshot} />
      <Controls
        onInsert={insert}
        onNext={() => navigate(step + 1)}
        onPrev={() => navigate(step - 1)}
        onFirst={() => navigate(0)}
        onLast={() => navigate(length - 1)}
        isFirst={step === 0}
        isLast={step === length - 1}
      />
    </div>
  );
}
