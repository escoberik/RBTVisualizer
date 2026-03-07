import RBTNode from "./RBTNode";
import RBTHistory from "./RBTHistory";

export default class RBTree {
  root: RBTNode | null;

  constructor() {
    this.root = null;
  }

  clone(): RBTree {
    const newTree = new RBTree();
    newTree.root = this.root?.clone() || null;
    return newTree;
  }

  insert(value: number): RBTHistory {
    const history = new RBTHistory(
      this.clone(),
      `Starting insertion of ${value}`,
    );
    this.insertUnder(this.root, new RBTNode(value), history);
    return history;
  }

  private insertUnder(
    node: RBTNode | null,
    newNode: RBTNode,
    history: RBTHistory,
  ) {
    if (!node) {
      this.root = newNode;
      history.log(this.clone(), `Inserted ${newNode.value} as root`);
    } else if (newNode.value < node.value) {
      if (!node.left) {
        node.left = newNode;
        newNode.parent = node;
        history.log(
          this.clone(),
          `Inserted ${newNode.value} as left child of ${node.value}`,
        );
      }
    }
  }
}
