import InternalNode from "../RBT/InternalNode";
import type Node from "../RBT/Node";
import RBTLayout from "../RBT/Layout";

export interface NodeLayout {
  offset: number;
  level: number;
  leftDistance?: number;
  rightDistance?: number;
}

export default class Layout<T> {
  readonly size: { width: number; height: number };
  private _nodeLayouts: Map<InternalNode<T>, NodeLayout> = new Map();

  get nodeLayouts(): ReadonlyMap<InternalNode<T>, NodeLayout> {
    return this._nodeLayouts;
  }

  constructor(root: Node<T>, showNil = false) {
    const rbtLayout = new RBTLayout(root, showNil);
    const { width, height } = rbtLayout.size;
    this.size = { width, height: height === 0 ? 0 : height * 2 - 1 };
    if (!root.isNil) this.build(root as InternalNode<T>, rbtLayout, showNil);
  }

  private build(
    node: InternalNode<T>,
    rbtLayout: RBTLayout<T>,
    showNil: boolean,
  ) {
    const { offset, level } = rbtLayout.getNodePosition(node)!;
    const layout: NodeLayout = { offset, level: level * 2 };

    if (node.left.isNil) {
      // Nil children in the showNil layout always land at distance 1 —
      // Grid.LEAF (width 1, leftOffset 0) is always packed adjacent to the parent.
      if (showNil) layout.leftDistance = 1;
    } else {
      layout.leftDistance =
        offset - rbtLayout.getNodePosition(node.left)!.offset;
      this.build(node.left as InternalNode<T>, rbtLayout, showNil);
    }

    if (node.right.isNil) {
      if (showNil) layout.rightDistance = 1;
    } else {
      layout.rightDistance =
        rbtLayout.getNodePosition(node.right)!.offset - offset;
      this.build(node.right as InternalNode<T>, rbtLayout, showNil);
    }

    this._nodeLayouts.set(node, layout);
  }
}
