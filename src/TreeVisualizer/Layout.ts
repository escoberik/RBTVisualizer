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

export interface FloatingNode<T> {
  value: T;
  offset: number;
  level: number;
}

export default class Layout<T> {
  readonly size: { width: number; height: number };
  readonly floatingNode: FloatingNode<T> | undefined;
  private _nodeLayouts: Map<T, NodeLayout> = new Map();

  get nodeLayouts(): ReadonlyMap<T, NodeLayout> {
    return this._nodeLayouts;
  }

  constructor(
    public readonly description: string,
    root: Node<T>,
    highlightValue?: T,
    floatingValue?: T,
    showNil = false,
  ) {
    const rbtLayout = new RBTLayout(root, showNil);
    const { width, height } = rbtLayout.size;
    this.size = { width, height: height === 0 ? 0 : height * 2 - 1 };

    if (!root.isNil) {
      const rootOffset = rbtLayout.getNodePosition(root as InternalNode<T>)!.offset;
      this.floatingNode = this.build(root as InternalNode<T>, rbtLayout, highlightValue, floatingValue, showNil, rootOffset);
      // No highlight match (e.g. INITIAL) — float to the left of the tree
      if (floatingValue !== undefined && !this.floatingNode) {
        this.floatingNode = { value: floatingValue, offset: -rootOffset - 1.5, level: 0 };
      }
    } else if (floatingValue !== undefined) {
      // Empty tree — floating node hovers at the center-left
      this.floatingNode = { value: floatingValue, offset: -1.5, level: 0 };
    }
  }

  private build(
    node: InternalNode<T>,
    rbtLayout: RBTLayout<T>,
    highlightValue: T | undefined,
    floatingValue: T | undefined,
    showNil: boolean,
    rootOffset: number,
  ): FloatingNode<T> | undefined {
    const { offset, level } = rbtLayout.getNodePosition(node)!;
    const relativeOffset = offset - rootOffset;
    const nodeLevel = level * 2;

    const layout: NodeLayout = {
      red: node.isRed,
      highlight: node.value === highlightValue,
      offset: relativeOffset,
      level: nodeLevel,
    };

    // Floating node hovers 0.5 units above the highlighted node
    let floatingNode: FloatingNode<T> | undefined;
    if (floatingValue !== undefined && node.value === highlightValue) {
      floatingNode = { value: floatingValue, offset: relativeOffset, level: nodeLevel - 1.5 };
    }

    let leftFloating: FloatingNode<T> | undefined;
    if (node.left.isNil) {
      // Nil children in the showNil layout always land at distance 1 —
      // Grid.LEAF (width 1, leftOffset 0) is always packed adjacent to the parent.
      if (showNil) layout.leftDistance = 1;
    } else {
      layout.leftDistance =
        offset - rbtLayout.getNodePosition(node.left)!.offset;
      leftFloating = this.build(node.left as InternalNode<T>, rbtLayout, highlightValue, floatingValue, showNil, rootOffset);
    }

    let rightFloating: FloatingNode<T> | undefined;
    if (node.right.isNil) {
      if (showNil) layout.rightDistance = 1;
    } else {
      layout.rightDistance =
        rbtLayout.getNodePosition(node.right)!.offset - offset;
      rightFloating = this.build(node.right as InternalNode<T>, rbtLayout, highlightValue, floatingValue, showNil, rootOffset);
    }

    this._nodeLayouts.set(node.value, layout);
    return floatingNode ?? leftFloating ?? rightFloating;
  }
}
