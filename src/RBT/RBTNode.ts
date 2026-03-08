interface RBOptions {
  color?: boolean; // true for red, false for black
  left?: RBTNode | null;
  right?: RBTNode | null;
  parent?: RBTNode | null;
}

export default class RBTNode {
  value: number;
  color: boolean;
  left: RBTNode | null;
  right: RBTNode | null;
  parent: RBTNode | null;

  constructor(
    value: number,
    options?: RBOptions,
  ) {
    this.value = value;
    this.color = options?.color ?? true; // New nodes are red by default
    this.left = options?.left ?? null;
    this.right = options?.right ?? null;
    this.parent = options?.parent ?? null;
  }

  isRed(): boolean {
    return this.color;
  }

  isBlack(): boolean {
    return !this.color;
  }

  paintRed() {
    this.color = true;
  }

  paintBlack() {
    this.color = false;
  }

  isRoot(): boolean {
    return !this.parent;
  }

  getSibling(): RBTNode | null {
    if (this.isRoot()) return null;

    if (this === this.parent!.left) {
      return this.parent!.right;
    } else {
      return this.parent!.left;
    }
  }

  getUncle(): RBTNode | null {
    return this.parent?.getSibling() || null;
  }

  clone(parent: RBTNode | null = null): RBTNode {
    const cloned = new RBTNode(this.value, { color: this.color, parent });
    cloned.left = this.left?.clone(cloned) ?? null;
    cloned.right = this.right?.clone(cloned) ?? null;
    return cloned;
  }
}
