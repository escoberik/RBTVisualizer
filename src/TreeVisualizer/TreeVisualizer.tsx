import { useState, useRef } from "react";
import Tree from "../RBT/Tree";
import History from "./History";
import Renderer from "./Renderer";
import Controls from "./Controls";
import { useLayoutTransition } from "./useLayoutTransition";

export default function TreeVisualizer() {
  const [index, setIndex] = useState(0);
  const [, setVersion] = useState(0);

  const ref = useRef<{ tree: Tree<number>; history: History<number> } | null>(
    null,
  );
  if (!ref.current) {
    const history = new History<number>();
    const tree = new Tree<number>(history.append.bind(history));
    history.reset(tree.root); // initial empty-tree snapshot, no floating node
    ref.current = { history, tree };
  }
  const { tree, history } = ref.current;
  const animated = useLayoutTransition(history.get(index)!);;

  function insert(value: number) {
    history.reset(tree.root, value, "insert"); // snapshot "before" state; value floats in
    tree.insert(value);       // tree mutates; logFn appends "after" state
    setIndex(0);
    setVersion((v) => v + 1);
  }

  function find(value: number) {
    history.reset(tree.root, value, "find");
    const found = tree.find(value);
    if (found === null && tree.root.isNil) {
      history.appendFinal("Not found", tree.root);
    }
    setIndex(0);
    setVersion((v) => v + 1);
  }

  function goNext() {
    setIndex((i) => Math.min(i + 1, history.length - 1));
  }
  function goPrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }
  function goFirst() {
    setIndex(0);
  }
  function goLast() {
    setIndex(history.length - 1);
  }

  return (
    <div className="visualizer">
      <p>{animated.description}</p>
      <Renderer layout={animated} viewport={history.size} />
      <Controls
        onInsert={insert}
        onFind={find}
        onNext={goNext}
        onPrev={goPrev}
        onFirst={goFirst}
        onLast={goLast}
        isFirst={index === 0}
        isLast={index === history.length - 1}
      />
    </div>
  );
}
