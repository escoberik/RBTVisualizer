export default abstract class Node<T> {
  abstract left: Node<T>;
  abstract right: Node<T>;
  abstract parent: Node<T>;

  abstract get isNil(): boolean;
  abstract get isRed(): boolean;
  abstract paintRed(): void;
  abstract paintBlack(): void;

  get isBlack(): boolean {
    return !this.isRed;
  }

  get sibling(): Node<T> {
    return this === this.parent.left ? this.parent.right : this.parent.left;
  }

  get uncle(): Node<T> {
    return this.parent.sibling;
  }
}
