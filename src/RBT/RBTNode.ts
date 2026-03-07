interface RBOptions {
  color?: boolean; // true for red, false for black
  left?: RBTNode | null;
  right?: RBTNode | null;
  parent?: RBTNode | null;
}

export default class RBTNode implements RBOptions {
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

  getSibling(): RBTNode | null {
    if (!this.parent) return null;

    if (this === this.parent.left) {
      return this.parent.right;
    } else {
      return this.parent.left;
    }
  }

  getUncle(): RBTNode | null {
    return this.parent?.getSibling() || null;
  }

  clone(parent?: RBTNode): RBTNode {
    return new RBTNode(this.value, {
      color: this.color,
      left: this.left?.clone(this) || null,
      right: this.right?.clone(this) || null,
      parent: parent || null,
    });
  }
}
