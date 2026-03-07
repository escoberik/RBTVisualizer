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
    const newNode = new RBTNode(value);
    const history = new RBTHistory(this.clone(), "create node", newNode.clone());
    this.insertUnder(this.root, newNode, history);
    this.fixInsert(newNode, history);

    if (this.root?.isRed()) {
      this.root.paintBlack();
      history.log(this.clone(), "repainted_root", this.root);
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
      history.log(this.clone(), "inserted_root", child);
      return;
    }

    if (child.value < parent.value) {
      history.log(this.clone(), "comparing_left", child, parent);

      if (parent.left) {
        this.insertUnder(parent.left, child, history);
      } else {
        parent.left = child;
        child.parent = parent;
        history.log(this.clone(), "inserted_left", child, parent);
      }
    } else {
      history.log(this.clone(), "comparing_right", child, parent);

      if (parent.right) {
        this.insertUnder(parent.right, child, history);
      } else {
        parent.right = child;
        child.parent = parent;
        history.log(this.clone(), "inserted_right", child, parent);
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
    history.log(this.clone(), "recolored", parent, uncle);

    grandparent.paintRed();
    history.log(this.clone(), "recolored_grandparent", grandparent);

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
      history.log(this.clone(), "rotated_left", parent);
      node = parent;
      parent = node.parent!;
    }

    this.rotateRight(grandparent);
    history.log(this.clone(), "rotated_right", grandparent);

    parent.paintBlack();
    grandparent.paintRed();
    history.log(this.clone(), "recolored_after_rotation", parent, grandparent);
  }

  private fixParentIsRight(
    node: RBTNode,
    parent: RBTNode,
    grandparent: RBTNode,
    history: RBTHistory,
  ) {
    if (node === parent.left) {
      this.rotateRight(parent);
      history.log(this.clone(), "rotated_right", parent);
      node = parent;
      parent = node.parent!;
    }

    this.rotateLeft(grandparent);
    history.log(this.clone(), "rotated_left", grandparent);

    parent.paintBlack();
    grandparent.paintRed();
    history.log(this.clone(), "recolored_after_rotation", parent, grandparent);
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
