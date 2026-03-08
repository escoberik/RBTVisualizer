import useSnapshotHistory from "./useSnapshotHistory";
import Controls from "./Controls";
import Renderer from "./Renderer";

export default function TreeVisualizer() {
  const { snapshot, isFirst, isLast, navigateFirst, navigateLast, navigateNext, navigatePrev, insert } = useSnapshotHistory();

  return (
    <div className="visualizer">
      <p>{snapshot?.description ?? "Insert a value to begin"}</p>
      <Renderer snapshot={snapshot} />
      <Controls
        onInsert={insert}
        onNext={navigateNext}
        onPrev={navigatePrev}
        onFirst={navigateFirst}
        onLast={navigateLast}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
}
