import InternalNode from "../../RBT/InternalNode";
import type Node from "../../RBT/Node";
import Layout from "../../RBT/Layout";

export interface NodeLayout {
  red: boolean;
  highlight: boolean;
  offset: number;
  level: number;
}

export interface EdgeDef<T> {
  parent: T;
  child: T;
}

export interface FloatingNode<T> {
  value: T;
  offset: number;
  level: number;
}

// A single frozen moment in History: the tree's node positions, edges, and
// optional floating node (the search cursor) as they appeared after one
// algorithm event. History stores a sequence of Snapshots; useLayoutTransition
// animates between consecutive ones.
export default class Snapshot<T> {
  readonly size: { width: number; height: number };
  readonly floatingNode: FloatingNode<T> | undefined;
  private _nodeLayouts: Map<T, NodeLayout> = new Map();
  private _edges: EdgeDef<T>[] = [];

  get nodeLayouts(): ReadonlyMap<T, NodeLayout> {
    return this._nodeLayouts;
  }

  get edges(): ReadonlyArray<EdgeDef<T>> {
    return this._edges;
  }

  constructor(
    public readonly description: string,
    root: Node<T>,
    highlightValue?: T,
    floatingValue?: T,
    showNil = false,
  ) {
    const treeLayout = new Layout(root, showNil);
    const { width, height } = treeLayout.size;
    this.size = { width, height: height === 0 ? 0 : height * 2 - 1 };

    if (!root.isNil) {
      const rootOffset = treeLayout.getNodePosition(root as InternalNode<T>)!.offset;
      this.floatingNode = this.build(root as InternalNode<T>, treeLayout, highlightValue, floatingValue, showNil, rootOffset);
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
    treeLayout: Layout<T>,
    highlightValue: T | undefined,
    floatingValue: T | undefined,
    showNil: boolean,
    rootOffset: number,
  ): FloatingNode<T> | undefined {
    const { offset, level } = treeLayout.getNodePosition(node)!;
    const relativeOffset = offset - rootOffset;
    const nodeLevel = level * 2;

    const layout: NodeLayout = {
      red: node.isRed,
      highlight: node.value === highlightValue,
      offset: relativeOffset,
      level: nodeLevel,
    };

    // Floating node hovers 1.5 units above the highlighted node
    let floatingNode: FloatingNode<T> | undefined;
    if (floatingValue !== undefined && node.value === highlightValue) {
      floatingNode = { value: floatingValue, offset: relativeOffset, level: nodeLevel - 1.5 };
    }

    let leftFloating: FloatingNode<T> | undefined;
    if (!node.left.isNil) {
      this._edges.push({ parent: node.value, child: (node.left as InternalNode<T>).value });
      leftFloating = this.build(node.left as InternalNode<T>, treeLayout, highlightValue, floatingValue, showNil, rootOffset);
    }

    let rightFloating: FloatingNode<T> | undefined;
    if (!node.right.isNil) {
      this._edges.push({ parent: node.value, child: (node.right as InternalNode<T>).value });
      rightFloating = this.build(node.right as InternalNode<T>, treeLayout, highlightValue, floatingValue, showNil, rootOffset);
    }

    this._nodeLayouts.set(node.value, layout);
    return floatingNode ?? leftFloating ?? rightFloating;
  }
}
