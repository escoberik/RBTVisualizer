import RBTreeSnapshot from "./RBTreeSnapshot";
import RBTree from "./RBTree";

export default class RBTHistory {
  snapshots: RBTreeSnapshot[];

  constructor(tree: RBTree, initialMessage: string) {
    this.snapshots = [new RBTreeSnapshot(tree.clone(), initialMessage)];
  }

  log(tree: RBTree, message: string) {
    this.snapshots.push(new RBTreeSnapshot(tree.clone(), message));
  }
}
