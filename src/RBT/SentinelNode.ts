import Node from "./Node";

export default class SentinelNode<T> extends Node<T> {
  left: Node<T> = this;
  right: Node<T> = this;
  parent: Node<T> = this;

  private static _instance: SentinelNode<unknown> | null = null;

  static getInstance<T>(): SentinelNode<T> {
    if (!SentinelNode._instance) SentinelNode._instance = new SentinelNode();
    return SentinelNode._instance as SentinelNode<T>;
  }

  private constructor() {
    super();
  }

  get isNil(): boolean {
    return true;
  }
  get isRed(): boolean {
    return false;
  }
  paintRed(): void {} // sentinel is permanently black
  paintBlack(): void {}
}
