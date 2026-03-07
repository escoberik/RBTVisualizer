import RBTNode from "./RBTNode";
import RBTHistory from "./RBTHistory";

export default class RBTree {
  root: RBTNode | null;

  constructor() {
    this.root = null;
  }

  isEmpty() {
    return this.root === null;
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
    const newNode = new RBTNode(value);
    this.insertUnder(this.root, newNode, history);
    this.fixInsert(newNode, history);

    if (this.root?.isRed()) {
      this.root.paintBlack();
      history.log(this.clone(), `Repainted root ${this.root.value} black`);
    }

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

  private fixInsert(node: RBTNode, history: RBTHistory) {
    if (node.isRoot()) return;

    const parent = node.parent!;
    if (parent.isBlack()) return;

    // Root is always black, so parent must have a grandparent
    const grandparent = parent.parent!;
    const uncle = node.getUncle();

    if (uncle?.isRed()) {
      this.fixUncleIsRed(parent, uncle, grandparent, history);
      return;
    }

    if (parent === grandparent.left) {
      this.fixParentIsLeft(node, parent, grandparent, history);
    } else {
      this.fixParentIsRight(node, parent, grandparent, history);
    }
  }

  private fixUncleIsRed(
    parent: RBTNode,
    uncle: RBTNode,
    grandparent: RBTNode,
    history: RBTHistory,
  ) {
    parent.paintBlack();
    uncle.paintBlack();
    history.log(
      this.clone(),
      `Repainted parent ${parent.value} and uncle ${uncle.value} black`,
    );

    grandparent.paintRed();
    history.log(this.clone(), `Repainted grandparent ${grandparent.value} red`);

    this.fixInsert(grandparent, history);
  }

  private fixParentIsLeft(
    node: RBTNode,
    parent: RBTNode,
    grandparent: RBTNode,
    history: RBTHistory,
  ) {
    if (node === parent.right) {
      this.rotateLeft(parent);
      history.log(this.clone(), `Left rotation on parent ${parent.value}`);
      node = parent;
      parent = node.parent!;
    }

    this.rotateRight(grandparent);
    history.log(this.clone(), `Right rotation on grandparent ${grandparent.value}`);

    parent.paintBlack();
    grandparent.paintRed();
    history.log(
      this.clone(),
      `Repainted parent ${parent.value} black and grandparent ${grandparent.value} red`,
    );
  }

  private fixParentIsRight(
    node: RBTNode,
    parent: RBTNode,
    grandparent: RBTNode,
    history: RBTHistory,
  ) {
    if (node === parent.left) {
      this.rotateRight(parent);
      history.log(this.clone(), `Right rotation on parent ${parent.value}`);
      node = parent;
      parent = node.parent!;
    }

    this.rotateLeft(grandparent);
    history.log(this.clone(), `Left rotation on grandparent ${grandparent.value}`);

    parent.paintBlack();
    grandparent.paintRed();
    history.log(
      this.clone(),
      `Repainted parent ${parent.value} black and grandparent ${grandparent.value} red`,
    );
  }

  private rotateLeft(node: RBTNode) {
    const pivot = node.right!;
    node.right = pivot.left;
    if (pivot.left) pivot.left.parent = node;

    pivot.parent = node.parent;
    if (!node.parent) {
      this.root = pivot;
    } else if (node === node.parent.left) {
      node.parent.left = pivot;
    } else {
      node.parent.right = pivot;
    }

    pivot.left = node;
    node.parent = pivot;
  }

  private rotateRight(node: RBTNode) {
    const pivot = node.left!;
    node.left = pivot.right;
    if (pivot.right) pivot.right.parent = node;

    pivot.parent = node.parent;
    if (!node.parent) {
      this.root = pivot;
    } else if (node === node.parent.right) {
      node.parent.right = pivot;
    } else {
      node.parent.left = pivot;
    }

    pivot.right = node;
    node.parent = pivot;
  }
}
