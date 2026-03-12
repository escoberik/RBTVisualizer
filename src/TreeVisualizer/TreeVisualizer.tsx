import { useRef, useState } from "react";
import Tree from "../RBT/Tree";
import Layout from "./Layout";
import Renderer from "./Renderer";
import Controls from "./Controls";

export default function TreeVisualizer() {
  const treeRef = useRef(new Tree<number>());
  const [layout, setLayout] = useState(new Layout(treeRef.current.root));

  function handleInsert(value: number) {
    treeRef.current.insert(value);
    setLayout(new Layout(treeRef.current.root)); 
  }

  const {root} = treeRef.current;
  return (
    <div className="visualizer">
      <Renderer root={root} layout={layout} />
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
