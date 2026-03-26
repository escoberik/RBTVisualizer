import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import Tree from "../RBT/Tree";
import History from "./History";
import Renderer from "./rendering/Renderer";
import Controls from "./Controls";
import StepTooltip from "./StepTooltip";
import QuickActions from "./QuickActions";
import StepNav from "./StepNav";
import { useLayoutTransition } from "./rendering/useLayoutTransition";
import { ColorsContext, type ThemeProps, resolveColors } from "./theme";
import { VALUE_MIN, VALUE_MAX } from "./constants";

function generateRandom(count: number, min: number, max: number): number[] {
  const values = new Set<number>();
  while (values.size < count) {
    values.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return [...values];
}

export default function TreeVisualizer({
  theme,
  initialValues,
  initialRandomCount,
  min = VALUE_MIN,
  max = VALUE_MAX,
}: {
  theme?: ThemeProps;
  initialValues?: number[];
  initialRandomCount?: number;
  min?: number;
  max?: number;
}) {
  const resolvedColors = resolveColors(theme);
  const [index, setIndex] = useState(0);
  const [, setVersion] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Tree and History live in a ref, not state: they are mutable objects that
  // manage their own internal state. React never needs to diff them — a plain
  // setVersion() nudge is enough to trigger a re-render after each mutation.
  const ref = useRef<{ tree: Tree<number>; history: History<number> } | null>(
    null,
  );
  if (!ref.current) {
    const history = new History<number>();
    const tree = new Tree<number>(history.append.bind(history));

    const seed = (
      initialValues ??
      (initialRandomCount ? generateRandom(initialRandomCount, min, max) : [])
    ).filter((v) => Number.isInteger(v) && v >= min && v <= max);
    for (const v of seed) tree.insert(v);

    history.reset(tree.root); // initial empty-tree snapshot, no floating node
    ref.current = { history, tree };
  }
  const { tree, history } = ref.current;
  const currentSnapshot = history.get(index)!;
  const animated = useLayoutTransition(currentSnapshot, history.generation);

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
    setValidationError(null);
    setVersion((v) => v + 1);
  }

  function armReset() {
    setResetArmed(true);
    resetTimerRef.current = setTimeout(() => {
      setResetArmed(false);
      resetTimerRef.current = null;
    }, 1500);
  }

  function disarmReset() {
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setResetArmed(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      disarmReset();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      disarmReset();
      goNext();
    } else if (e.key === "r" || e.key === "R") {
      if (resetArmed) {
        disarmReset();
        reset();
      } else {
        armReset();
      }
    } else {
      disarmReset();
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
        <div className="tree-container">
          <StepTooltip
            description={
              currentSnapshot.nodeLayouts.size === 0
                ? "Insert a value to begin"
                : animated.description
            }
            error={validationError}
          />
          <QuickActions resetArmed={resetArmed} />
          <Renderer layout={animated} viewport={history.size} />
          {history.length > 1 && (
            <StepNav
              index={index}
              total={history.length}
              onGo={setIndex}
            />
          )}
        </div>
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
          min={min}
          max={max}
          onValidationError={setValidationError}
        />
      </div>
    </ColorsContext.Provider>
  );
}
