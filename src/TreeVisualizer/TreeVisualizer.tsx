import { useRef, useState } from "react";
import Tree from "../RBT/Tree";
import Layout from "../RBT/Layout";
import Renderer from "./Renderer";
import Controls from "./Controls";

export default function TreeVisualizer() {
  const treeRef = useRef(new Tree<number>());
  const [, setCount] = useState(0);

  function handleInsert(value: number) {
    treeRef.current.insert(value);
    setCount((c) => c + 1);
  }

  const tree = treeRef.current;
  const layout = new Layout(tree.root);

  return (
    <div className="visualizer">
      <Renderer root={tree.root} layout={layout} />
      <Controls
        onInsert={handleInsert}
        onNext={() => {}}
        onPrev={() => {}}
        onFirst={() => {}}
        onLast={() => {}}
        isFirst={true}
        isLast={true}
      />
    </div>
  );
}
