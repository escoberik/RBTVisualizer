import { useState, useRef, type KeyboardEvent } from "react";
import Tree from "../RBT/Tree";
import History from "./History";
import Renderer from "./rendering/Renderer";
import Controls from "./Controls";
import { useLayoutTransition } from "./rendering/useLayoutTransition";
import { ColorsContext, type ThemeProps, resolveColors } from "./theme";

function generateRandom(count: number): number[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(Math.floor(Math.random() * 999) + 1);
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

  function reset() {
    const newHistory = new History<number>();
    const newTree = new Tree<number>(newHistory.append.bind(newHistory));
    newHistory.reset(newTree.root);
    ref.current = { tree: newTree, history: newHistory };
    setIndex(0);
    setVersion((v) => v + 1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "r" || e.key === "R") {
      reset();
    }
  }

  return (
    <ColorsContext.Provider value={resolvedColors}>
      {/* tabIndex makes the container focusable so onKeyDown receives events
          from anywhere within this instance, not from other instances. */}
      <div
        className="visualizer"
        tabIndex={0}
        aria-label="Red-Black Tree Visualizer"
        onKeyDown={handleKeyDown}
      >
        <p role="status" aria-live="polite">
          <span>{animated.description}</span>
          {history.length > 1 && (
            <span className="step-counter">{index + 1} / {history.length}</span>
          )}
        </p>
        {animated.nodeLayouts.size === 0 && (
          <p className="tree-empty">Insert a value to begin</p>
        )}
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
