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
    parent: RBTNode | null,
    child: RBTNode,
    history: RBTHistory,
  ) {
    if (!parent) {
      this.root = child;
      history.log(this.clone(), `Inserted ${child.value} as root`);
      return;
    }

    if (child.value < parent.value) {
      history.log(this.clone(), `${child.value} < ${parent.value}, going left`);

      if (parent.left) {
        this.insertUnder(parent.left, child, history);
      } else {
        parent.left = child;
        child.parent = parent;
        history.log(
          this.clone(),
          `Inserted ${child.value} as left child of ${parent.value}`,
        );
      }
    } else {
      history.log(this.clone(), `${child.value} >= ${parent.value}, going right`);

      if (parent.right) {
        this.insertUnder(parent.right, child, history);
      } else {
        parent.right = child;
        child.parent = parent;
        history.log(
          this.clone(),
          `Inserted ${child.value} as right child of ${parent.value}`,
        );
      }
    }
  }
}
