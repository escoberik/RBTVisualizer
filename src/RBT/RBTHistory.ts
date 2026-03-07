import RBTSnapshot from "./RBTSnapshot";
import RBTree from "./RBTree";

export default class RBTHistory {
  snapshots: RBTSnapshot[];

  constructor(tree: RBTree, initialMessage: string) {
    this.snapshots = [new RBTSnapshot(tree.clone(), initialMessage)];
  }

  log(tree: RBTree, message: string) {
    this.snapshots.push(new RBTSnapshot(tree.clone(), message));
  }

  getSnapshot(index: number): RBTSnapshot | null {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index];
  }

  get length(): number {
    return this.snapshots.length;
  }
}
