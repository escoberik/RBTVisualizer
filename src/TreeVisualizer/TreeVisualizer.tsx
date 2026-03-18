import { useState, useRef, useEffect } from "react";
import Tree from "../RBT/Tree";
import History from "./History";
import Renderer from "./rendering/Renderer";
import Controls from "./Controls";
import { useLayoutTransition } from "./rendering/useLayoutTransition";
import { ColorsContext, type ThemeProps, resolveColors } from "./theme";

function generateRandom(count: number): number[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(Math.floor(Math.random() * 99) + 1);
  }
  return [...values];
}

export default function TreeVisualizer({
  theme,
  initialValues,
  initialRandomCount,
}: {
  theme?: ThemeProps;
  initialValues?: number[];
  initialRandomCount?: number;
}) {
  const resolvedColors = resolveColors(theme);
  const [index, setIndex] = useState(0);
  const [, setVersion] = useState(0);

  const ref = useRef<{ tree: Tree<number>; history: History<number> } | null>(
    null,
  );
  if (!ref.current) {
    const history = new History<number>();
    const tree = new Tree<number>(history.append.bind(history));

    const seed = initialValues ?? (
      initialRandomCount ? generateRandom(initialRandomCount) : []
    );
    for (const v of seed) tree.insert(v);

    history.reset(tree.root); // initial empty-tree snapshot, no floating node
    ref.current = { history, tree };
  }
  const { tree, history } = ref.current;
  const animated = useLayoutTransition(history.get(index)!);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialValues?.some((v) => v > 99)) {
      console.warn(
        "[TreeVisualizer] initialValues contains numbers > 99. " +
          "Node labels may overflow.",
      );
    }
  }, []);

  function insert(value: number) {
    history.reset(tree.root, value, "insert");
    tree.insert(value);
    setIndex(0);
    setVersion((v) => v + 1);
  }

  function del(value: number) {
    history.reset(tree.root, value, "delete");
    const deleted = tree.delete(value);
    if (!deleted && tree.root.isNil) {
      history.appendFinal("Not found", tree.root);
    }
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
    <ColorsContext.Provider value={resolvedColors}>
      <div className="visualizer">
        <p>{animated.description}</p>
        <Renderer layout={animated} viewport={history.size} />
        <Controls
          onInsert={insert}
          onFind={find}
          onDelete={del}
          onNext={goNext}
          onPrev={goPrev}
          onFirst={goFirst}
          onLast={goLast}
          isFirst={index === 0}
          isLast={index === history.length - 1}
        />
      </div>
    </ColorsContext.Provider>
  );
}
