interface RBOptions {
  red?: boolean;
  parent?: RBTNode | null;
}

export default class RBTNode {
  value: number;
  red: boolean;
  left: RBTNode | null;
  right: RBTNode | null;
  parent: RBTNode | null;

  constructor(
    value: number,
    options?: RBOptions,
  ) {
    this.value = value;
    this.red = options?.red ?? true; // New nodes are red by default
    this.left = null;
    this.right = null;
    this.parent = options?.parent ?? null;
  }

  get isRed(): boolean {
    return this.red;
  }

  get isBlack(): boolean {
    return !this.red;
  }

  paintRed() {
    this.red = true;
  }

  paintBlack() {
    this.red = false;
  }

  get isRoot(): boolean {
    return !this.parent;
  }

  get sibling(): RBTNode | null {
    if (this.isRoot) return null;

    if (this === this.parent!.left) {
      return this.parent!.right;
    } else {
      return this.parent!.left;
    }
  }

  get uncle(): RBTNode | null {
    return this.parent?.sibling ?? null;
  }

  clone(): RBTNode {
    return this.cloneWithParent(null);
  }

  private cloneWithParent(parent: RBTNode | null): RBTNode {
    const cloned = new RBTNode(this.value, { red: this.red, parent });
    cloned.left = this.left?.cloneWithParent(cloned) ?? null;
    cloned.right = this.right?.cloneWithParent(cloned) ?? null;
    return cloned;
  }
}
