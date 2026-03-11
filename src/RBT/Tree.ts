import Node from "./Node";
import SentinelNode from "./SentinelNode";
import InternalNode from "./InternalNode";
import type { EventType, LogFn } from "./types";

export default class RBTree<T> {
  root: Node<T>;
  readonly NIL: SentinelNode<T>;

  constructor(private logFn?: LogFn<Node<T>>) {
    this.NIL = SentinelNode.getInstance<T>();
    this.root = this.NIL;
  }

  insert(value: T): InternalNode<T> {
    const newNode = new InternalNode<T>(value);
    this.insertUnder(this.root, newNode);
    this.fixInsert(newNode);
    this.repaintRoot();
    return newNode;
  }

  private insertUnder(parent: Node<T>, child: InternalNode<T>) {
    if (parent.isNil) {
      this.root = child;
      this.log("INSERT", child);
      return;
    }

    const p = parent as InternalNode<T>; // safe: guarded by isNil above
    if (child.value < p.value) {
      if (parent.left.isNil) {
        parent.left = child;
        child.parent = parent;
      } else {
        this.insertUnder(parent.left, child);
      }
    } else {
      if (parent.right.isNil) {
        parent.right = child;
        child.parent = parent;
      } else {
        this.insertUnder(parent.right, child);
      }
    }
  }

  private fixInsert(node: Node<T>) {
    if (node === this.root) return;
    if (node.isNil) return;

    const { parent, uncle } = node;
    if (parent.isBlack) return;

    const grandparent = parent.parent;
    if (grandparent.isNil) return;

    if (uncle.isRed) {
      this.fixUncleIsRed(parent, uncle, grandparent);
      return;
    }

    if (parent === grandparent.left) {
      this.fixParentIsLeft(node, parent, grandparent);
    } else {
      this.fixParentIsRight(node, parent, grandparent);
    }
  }

  private fixUncleIsRed(parent: Node<T>, uncle: Node<T>, grandparent: Node<T>) {
    parent.paintBlack();
    uncle.paintBlack();

    grandparent.paintRed();

    this.fixInsert(grandparent);
  }

  private fixParentIsLeft(node: Node<T>, parent: Node<T>, grandparent: Node<T>) {
    if (node === parent.right) {
      this.rotateLeft(parent);
      node = parent;
      parent = node.parent;
    }

    this.rotateRight(grandparent);

    parent.paintBlack();
    grandparent.paintRed();
  }

  private fixParentIsRight(node: Node<T>, parent: Node<T>, grandparent: Node<T>) {
    if (node === parent.left) {
      this.rotateRight(parent);
      node = parent;
      parent = node.parent;
    }

    this.rotateLeft(grandparent);

    parent.paintBlack();
    grandparent.paintRed();
  }

  private rotateLeft(node: Node<T>) {
    const pivot = node.right;
    node.right = pivot.left;
    if (!pivot.left.isNil) {
      pivot.left.parent = node;
    }

    pivot.parent = node.parent;
    if (node.parent.isNil) {
      this.root = pivot;
    } else if (node === node.parent.left) {
      node.parent.left = pivot;
    } else {
      node.parent.right = pivot;
    }

    pivot.left = node;
    node.parent = pivot;
  }

  private rotateRight(node: Node<T>) {
    const pivot = node.left;
    node.left = pivot.right;
    if (!pivot.right.isNil) pivot.right.parent = node;

    pivot.parent = node.parent;
    if (node.parent.isNil) {
      this.root = pivot;
    } else if (node === node.parent.right) {
      node.parent.right = pivot;
    } else {
      node.parent.left = pivot;
    }

    pivot.right = node;
    node.parent = pivot;
  }

  private repaintRoot() {
    if (this.root.isBlack) return;
    this.root.paintBlack();
  }

  private log(event: EventType, node: Node<T>) {
    if (this.logFn) {
      this.logFn(event, node);
    }
  }
}
