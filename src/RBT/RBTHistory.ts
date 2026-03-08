import RBTNode from "./RBTNode";
import RBTSnapshot from "./RBTSnapshot";
import RBTree from "./RBTree";
import { OperationType } from "./RBTOperationType";

export default class RBTHistory {
  private snapshots: RBTSnapshot[];

  constructor(tree: RBTree, type: OperationType, ...nodes: RBTNode[]) {
    this.snapshots = [new RBTSnapshot(tree, { type, nodes: nodes.map(n => new RBTNode(n.value, { color: n.color })) })];
  }

  log(tree: RBTree, type: OperationType, ...nodes: RBTNode[]) {
    this.snapshots.push(new RBTSnapshot(tree, { type, nodes: nodes.map(n => new RBTNode(n.value, { color: n.color })) }));
  }

  getSnapshot(index: number): RBTSnapshot | null {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index];
  }

  get length(): number {
    return this.snapshots.length;
  }
}
