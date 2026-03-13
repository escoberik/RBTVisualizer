import InternalNode from "../RBT/InternalNode";
import type Node from "../RBT/Node";
import RBTLayout from "../RBT/Layout";

export interface NodeLayout {
  red: boolean;
  highlight: boolean;
  offset: number;
  level: number;
  leftDistance?: number;
  rightDistance?: number;
}

export default class Layout<T> {
  readonly size: { width: number; height: number };
  private _nodeLayouts: Map<T, NodeLayout> = new Map();

  get nodeLayouts(): ReadonlyMap<T, NodeLayout> {
    return this._nodeLayouts;
  }

  constructor(
    public readonly description: string,
    root: Node<T>,
    highlightValue?: T,
    showNil = false,
  ) {
    const rbtLayout = new RBTLayout(root, showNil);
    const { width, height } = rbtLayout.size;
    this.size = { width, height: height === 0 ? 0 : height * 2 - 1 };
    if (!root.isNil) {
      const rootOffset = rbtLayout.getNodePosition(root as InternalNode<T>)!.offset;
      this.build(root as InternalNode<T>, rbtLayout, highlightValue, showNil, rootOffset);
    }
  }

  private build(
    node: InternalNode<T>,
    rbtLayout: RBTLayout<T>,
    highlightValue: T | undefined,
    showNil: boolean,
    rootOffset: number,
  ) {
    const { offset, level } = rbtLayout.getNodePosition(node)!;
    const layout: NodeLayout = {
      red: node.isRed,
      highlight: node.value === highlightValue,
      offset: offset - rootOffset,  // root-relative: root lands at 0
      level: level * 2,
    };

    if (node.left.isNil) {
      // Nil children in the showNil layout always land at distance 1 —
      // Grid.LEAF (width 1, leftOffset 0) is always packed adjacent to the parent.
      if (showNil) layout.leftDistance = 1;
    } else {
      layout.leftDistance =
        offset - rbtLayout.getNodePosition(node.left)!.offset;
      this.build(node.left as InternalNode<T>, rbtLayout, highlightValue, showNil, rootOffset);
    }

    if (node.right.isNil) {
      if (showNil) layout.rightDistance = 1;
    } else {
      layout.rightDistance =
        rbtLayout.getNodePosition(node.right)!.offset - offset;
      this.build(node.right as InternalNode<T>, rbtLayout, highlightValue, showNil, rootOffset);
    }

    this._nodeLayouts.set(node.value, layout);
  }
}
