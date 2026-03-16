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

  delete(value: T): boolean {
    const { found, position } = this.findPosition(this.root, value);
    if (!found) {
      if (!position.isNil) {
        this.log("NOT_FOUND", position as InternalNode<T>);
      }
      return false;
    }
    this.deleteNode(position as InternalNode<T>);
    return true;
  }

  private minimum(node: Node<T>): InternalNode<T> {
    let n = node as InternalNode<T>;
    while (!n.left.isNil) n = n.left as InternalNode<T>;
    return n;
  }

  // Splice v into u's position. Does NOT set v.parent when v is NIL
  // (NIL is a singleton — callers track xParent explicitly).
  private transplant(u: Node<T>, v: Node<T>) {
    if (u.parent.isNil) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    if (!v.isNil) v.parent = u.parent;
  }

  private deleteNode(z: InternalNode<T>) {
    let y: Node<T> = z;
    let yOriginallyRed = y.isRed;
    let x: Node<T>;
    let xParent: Node<T>;

    if (z.left.isNil) {
      x = z.right;
      xParent = z.parent;
      this.transplant(z, z.right);
      this.log("DELETE", z);
    } else if (z.right.isNil) {
      x = z.left;
      xParent = z.parent;
      this.transplant(z, z.left);
      this.log("DELETE", z);
    } else {
      y = this.minimum(z.right);
      yOriginallyRed = y.isRed;
      x = y.right;

      this.log("REPLACE_WITH_SUCCESSOR", z);

      if (y.parent === z) {
        xParent = y;
      } else {
        xParent = y.parent;
        this.transplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }
      this.transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      if (z.isRed) y.paintRed(); else y.paintBlack();
      this.log("DELETE", y as InternalNode<T>);
    }

    if (!yOriginallyRed) {
      this.fixDelete(x, xParent);
    }
  }

  private fixDelete(x: Node<T>, xParent: Node<T>) {
    while (x !== this.root && x.isBlack) {
      if (x === xParent.left) {
        let w = xParent.right;
        if (w.isRed) {
          // Case 1: sibling is red
          w.paintBlack();
          xParent.paintRed();
          this.rotateLeft(xParent);
          w = xParent.right;
        }
        if (w.left.isBlack && w.right.isBlack) {
          // Case 2: sibling has two black children
          w.paintRed();
          this.log("RECOLOR_SIBLING", w as InternalNode<T>);
          x = xParent;
          xParent = x.parent;
        } else {
          if (w.right.isBlack) {
            // Case 3: sibling's right child is black
            w.left.paintBlack();
            w.paintRed();
            this.rotateRight(w);
            w = xParent.right;
          }
          // Case 4: sibling's right child is red
          this.rotateLeft(xParent);
          if (xParent.isRed) w.paintRed(); else w.paintBlack();
          xParent.paintBlack();
          w.right.paintBlack();
          this.log("RECOLOR_AFTER_ROTATION", w as InternalNode<T>);
          x = this.root;
          break;
        }
      } else {
        let w = xParent.left;
        if (w.isRed) {
          // Case 1 (mirror)
          w.paintBlack();
          xParent.paintRed();
          this.rotateRight(xParent);
          w = xParent.left;
        }
        if (w.right.isBlack && w.left.isBlack) {
          // Case 2 (mirror)
          w.paintRed();
          this.log("RECOLOR_SIBLING", w as InternalNode<T>);
          x = xParent;
          xParent = x.parent;
        } else {
          if (w.left.isBlack) {
            // Case 3 (mirror)
            w.right.paintBlack();
            w.paintRed();
            this.rotateLeft(w);
            w = xParent.left;
          }
          // Case 4 (mirror)
          this.rotateRight(xParent);
          if (xParent.isRed) w.paintRed(); else w.paintBlack();
          xParent.paintBlack();
          w.left.paintBlack();
          this.log("RECOLOR_AFTER_ROTATION", w as InternalNode<T>);
          x = this.root;
          break;
        }
      }
    }
    if (x.isRed) {
      x.paintBlack();
      this.log("RECOLOR_ABSORBED", x as InternalNode<T>);
    }
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
