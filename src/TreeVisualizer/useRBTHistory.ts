import { useRef, useState } from "react";
import RBTNode from "../RBT/RBTNode";
import RBTHistory from "../RBT/RBTHistory";
import RBTSnapshot from "../RBT/RBTSnapshot";
import RBTree from "../RBT/RBTree";

export default function useRBTHistory() {
  const tree = useRef(new RBTree());
  const history = useRef(new RBTHistory(tree.current.clone(), "start"));
  const [step, setStep] = useState(0);
  const [snapshot, setSnapshot] = useState<RBTSnapshot>(
    () => history.current.getSnapshot(0)!,
  );

  function navigate(i: number) {
    const s = history.current.getSnapshot(i);
    if (s) {
      setStep(i);
      setSnapshot(s);
    }
  }

  function insert(value: number) {
    const newHistory = new RBTHistory(tree.current.clone(), "new", new RBTNode(value));
    tree.current.insert(value, (type, ...nodes) => {
      newHistory.log(tree.current.clone(), type, ...nodes);
    });
    history.current = newHistory;
    setStep(0);
    setSnapshot(newHistory.getSnapshot(0)!);
  }

  return {
    snapshot,
    step,
    length: history.current.length,
    navigate,
    insert,
  };
}
