import Node from "./Node";
import SentinelNode from "./SentinelNode";

export default class InternalNode<T> extends Node<T> {
  left: Node<T>;
  right: Node<T>;
  parent: Node<T>;
  private red: boolean = true;

  constructor(public value: T) {
    super();
    const nil = SentinelNode.getInstance<T>();
    this.left = nil;
    this.right = nil;
    this.parent = nil;
  }

  get isNil(): boolean { return false; }
  get isRed(): boolean { return this.red; }
  paintRed(): void { this.red = true; }
  paintBlack(): void { this.red = false; }
}
