import { useRef, useState } from "react";
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
    history.current = tree.current.insert(value);
    setStep(0);
    setSnapshot(history.current.getSnapshot(0)!);
  }

  return {
    snapshot,
    step,
    length: history.current.length,
    navigate,
    insert,
  };
}
