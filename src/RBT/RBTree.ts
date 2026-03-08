import RBTNode from "./RBTNode";
import { OperationType } from "./RBTOperationType";

type StepLogger = (type: OperationType, ...nodes: RBTNode[]) => void;

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
    newTree.root = this.root?.clone() ?? null;
    return newTree;
  }

  insert(value: number, log: StepLogger): void {
    const newNode = new RBTNode(value);
    this.insertUnder(this.root, newNode, log);
    this.fixInsert(newNode, log);

    if (this.root?.isRed()) {
      this.root.paintBlack();
      log("repainted_root", this.root);
    }
  }

  private insertUnder(parent: RBTNode | null, child: RBTNode, log: StepLogger) {
    if (!parent) {
      this.root = child;
      log("inserted_root", child);
      return;
    }

    if (child.value < parent.value) {
      log("comparing_left", child, parent);
      if (parent.left) {
        this.insertUnder(parent.left, child, log);
      } else {
        parent.left = child;
        child.parent = parent;
        log("inserted_left", child, parent);
      }
    } else {
      log("comparing_right", child, parent);
      if (parent.right) {
        this.insertUnder(parent.right, child, log);
      } else {
        parent.right = child;
        child.parent = parent;
        log("inserted_right", child, parent);
      }
    }
  }

  private fixInsert(node: RBTNode, log: StepLogger) {
    if (node.isRoot()) return;

    const parent = node.parent!;
    if (parent.isBlack()) return;

    // Root is always black, so parent must have a grandparent
    const grandparent = parent.parent!;
    const uncle = node.getUncle();

    if (uncle?.isRed()) {
      this.fixUncleIsRed(parent, uncle, grandparent, log);
      return;
    }

    if (parent === grandparent.left) {
      this.fixParentIsLeft(node, parent, grandparent, log);
    } else {
      this.fixParentIsRight(node, parent, grandparent, log);
    }
  }

  private fixUncleIsRed(
    parent: RBTNode,
    uncle: RBTNode,
    grandparent: RBTNode,
    log: StepLogger,
  ) {
    parent.paintBlack();
    uncle.paintBlack();
    log("recolored", parent, uncle);

    grandparent.paintRed();
    log("recolored_grandparent", grandparent);

    this.fixInsert(grandparent, log);
  }

  private fixParentIsLeft(
    node: RBTNode,
    parent: RBTNode,
    grandparent: RBTNode,
    log: StepLogger,
  ) {
    if (node === parent.right) {
      this.rotateLeft(parent);
      log("rotated_left", parent);
      node = parent;
      parent = node.parent!;
    }

    this.rotateRight(grandparent);
    log("rotated_right", grandparent);

    parent.paintBlack();
    grandparent.paintRed();
    log("recolored_after_rotation", parent, grandparent);
  }

  private fixParentIsRight(
    node: RBTNode,
    parent: RBTNode,
    grandparent: RBTNode,
    log: StepLogger,
  ) {
    if (node === parent.left) {
      this.rotateRight(parent);
      log("rotated_right", parent);
      node = parent;
      parent = node.parent!;
    }

    this.rotateLeft(grandparent);
    log("rotated_left", grandparent);

    parent.paintBlack();
    grandparent.paintRed();
    log("recolored_after_rotation", parent, grandparent);
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
