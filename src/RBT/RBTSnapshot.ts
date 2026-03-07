import RBTree from "./RBTree";

export default class RBTSnapshot {
  readonly tree: RBTree;
  readonly description: string;

  constructor(tree: RBTree, description: string) {
    this.tree = tree;
    this.description = description;
  }
}
