import Node from "./Node";
import SentinelNode from "./SentinelNode";
import InternalNode from "./InternalNode";
import type { EventType, LogFn } from "./types";

type FindResult<T> = { found: boolean; position: Node<T> };

export default class RBTree<T> {
  root: Node<T>;
  readonly NIL: SentinelNode<T>;

  constructor(private logFn?: LogFn<Node<T>>) {
    this.NIL = SentinelNode.getInstance<T>();
    this.root = this.NIL;
  }

  find(value: T): InternalNode<T> | null {
    const { found, position } = this.findPosition(this.root, value);
    if (!found && !position.isNil) {
      this.log("NOT_FOUND", position as InternalNode<T>);
    }
    return found ? (position as InternalNode<T>) : null;
  }

  insert(value: T): InternalNode<T> {
    const { found, position } = this.findPosition(this.root, value);
    if (found) return position as InternalNode<T>; // ignore duplicates

    const newNode = new InternalNode<T>(value);
    if (position.isNil) {
      this.root = newNode;
    } else {
      const parent = position as InternalNode<T>;
      if (value < parent.value) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
      newNode.parent = parent;
    }
    this.log("INSERT", newNode);
    this.fixInsert(newNode);
    this.repaintRoot();
    return newNode;
  }

  private findPosition(node: Node<T>, value: T): FindResult<T> {
    if (node.isNil) return { found: false, position: this.NIL };
    const n = node as InternalNode<T>;
    if (value === n.value) {
      this.log("FOUND", n);
      return { found: true, position: n };
    }
    if (value < n.value) {
      this.log("COMPARE_LEFT", n);
      if (node.left.isNil) return { found: false, position: n };
      return this.findPosition(node.left, value);
    } else {
      this.log("COMPARE_RIGHT", n);
      if (node.right.isNil) return { found: false, position: n };
      return this.findPosition(node.right, value);
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
    this.log("RECOLOR_UNCLE_RED", grandparent as InternalNode<T>);
    this.fixInsert(grandparent);
  }

  private fixParentIsLeft(
    node: Node<T>,
    parent: Node<T>,
    grandparent: Node<T>,
  ) {
    if (node === parent.right) {
      this.rotateLeft(parent);
      node = parent;
      parent = node.parent;
    }

    this.rotateRight(grandparent);

    parent.paintBlack();
    grandparent.paintRed();
    this.log("RECOLOR_AFTER_ROTATION", parent as InternalNode<T>);
  }

  private fixParentIsRight(
    node: Node<T>,
    parent: Node<T>,
    grandparent: Node<T>,
  ) {
    if (node === parent.left) {
      this.rotateRight(parent);
      node = parent;
      parent = node.parent;
    }

    this.rotateLeft(grandparent);

    parent.paintBlack();
    grandparent.paintRed();
    this.log("RECOLOR_AFTER_ROTATION", parent as InternalNode<T>);
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
    this.log("ROTATE_LEFT", pivot as InternalNode<T>);
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
    this.log("ROTATE_RIGHT", pivot as InternalNode<T>);
  }

  private repaintRoot() {
    if (this.root.isBlack) return;
    this.root.paintBlack();
    this.log("RECOLOR_ROOT", this.root as InternalNode<T>);
  }

  private log(event: EventType, subject: InternalNode<T>) {
    this.logFn?.(event, this.root, subject);
  }
}
