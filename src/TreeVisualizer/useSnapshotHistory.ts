import { useRef, useState } from "react";
import RBTNode from "../RBT/RBTNode";
import RBTree from "../RBT/RBTree";
import SnapshotHistory from "./SnapshotHistory";
import type Snapshot from "./Snapshot";
import type { OperationNode } from "./Snapshot";

function toOperand(node: RBTNode): OperationNode {
  return { value: node.value, red: node.red };
}

export default function useSnapshotHistory() {
  const tree = useRef(new RBTree());
  const history = useRef<SnapshotHistory | null>(null);
  const [step, setStep] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  function navigate(i: number) {
    const s = history.current?.getSnapshot(i);
    if (s) {
      setStep(i);
      setSnapshot(s);
    }
  }

  function insert(value: number) {
    // A ghost node to represent the newly inserted node in the snapshot before
    // it's actually inserted
    const ghostNode = new RBTNode(value);
    const preInsertRoot = tree.current.root?.clone() ?? null;
    const newHistory = new SnapshotHistory(
      preInsertRoot,
      "new",
      toOperand(ghostNode),
    );

    tree.current.insert(value, (type, first, ...rest) => {
      newHistory.record(
        tree.current.root?.clone() ?? null,
        type,
        toOperand(first),
        ...rest.map(toOperand),
      );
    });
    history.current = newHistory;
    setStep(0);
    setSnapshot(newHistory.getSnapshot(0)!);
  }

  function navigateFirst() {
    navigate(0);
  }
  function navigateLast() {
    if (history.current) navigate(history.current.length - 1);
  }
  function navigateNext() {
    navigate(step + 1);
  }
  function navigatePrev() {
    navigate(step - 1);
  }

  const length = history.current?.length ?? 0;

  return {
    snapshot,
    isFirst: length === 0 || step === 0,
    isLast: length === 0 || step === length - 1,
    navigateFirst,
    navigateLast,
    navigateNext,
    navigatePrev,
    insert,
  };
}
