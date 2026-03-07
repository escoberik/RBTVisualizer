import RBTNode from "./RBTNode";
import RBTSnapshot, { OperationType } from "./RBTSnapshot";
import RBTree from "./RBTree";

export default class RBTHistory {
  snapshots: RBTSnapshot[];

  constructor(tree: RBTree, type: OperationType, ...nodes: RBTNode[]) {
    this.snapshots = [new RBTSnapshot(tree, { type, nodes })];
  }

  log(tree: RBTree, type: OperationType, ...nodes: RBTNode[]) {
    this.snapshots.push(new RBTSnapshot(tree, { type, nodes }));
  }

  getSnapshot(index: number): RBTSnapshot | null {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index];
  }

  get length(): number {
    return this.snapshots.length;
  }
}
