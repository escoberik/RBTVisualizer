import Node from "./Node";
import type { NodePosition } from "./types";
import { Grid } from "./Grid";

type Grids<T> = Map<Node<T>, Grid>;

export default class Layout<T> {
  readonly size: { width: number; height: number };
  private positions: Map<Node<T>, NodePosition> = new Map();

  constructor(root: Node<T>, showNil?: boolean) {
    const grids: Grids<T> = new Map();
    Layout.buildGrid(root, grids, showNil ?? false);

    const rootGrid = grids.get(root);
    this.size = rootGrid
      ? { width: rootGrid.width, height: rootGrid.height }
      : { width: 0, height: 0 };

    if (!root.isNil) {
      this.buildPositionsForLeftNode(root, 0, 0, grids);
    }
  }

  getNodePosition(node: Node<T>): NodePosition | undefined {
    return this.positions.get(node);
  }

  private static setGrid<T>(grids: Grids<T>, node: Node<T>, grid: Grid): Grid {
    grids.set(node, grid);
    return grid;
  }

  private static buildGrid<T>(
    node: Node<T>,
    grids: Grids<T>,
    showNil: boolean,
  ): Grid {
    if (showNil) {
      if (node.isNil) return Grid.LEAF;
    } else {
      if (node.isNil) return Grid.BLANK;

      if (node.left.isNil && node.right.isNil) {
        return Layout.setGrid(grids, node, Grid.LEAF);
      }
    }

    return Layout.setGrid(
      grids,
      node,
      Grid.merge(
        Layout.buildGrid(node.left, grids, showNil),
        Layout.buildGrid(node.right, grids, showNil),
      ),
    );
  }

  private buildPositionsForLeftNode(
    node: Node<T>,
    parentLeftOffset: number,
    level: number,
    grids: Grids<T>,
  ) {
    const {
      width,
      lines: [{ leftOffset }],
    } = grids.get(node)!;
    const parentRightOffset = parentLeftOffset + width;

    this.positions.set(node, { offset: parentLeftOffset + leftOffset, level });

    if (!node.left.isNil) {
      this.buildPositionsForLeftNode(
        node.left,
        parentLeftOffset,
        level + 1,
        grids,
      );
    }

    if (!node.right.isNil) {
      this.buildPositionsForRightNode(
        node.right,
        parentRightOffset,
        level + 1,
        grids,
      );
    }
  }

  private buildPositionsForRightNode(
    node: Node<T>,
    parentRightOffset: number,
    level: number,
    grids: Grids<T>,
  ) {
    const {
      width,
      lines: [{ leftOffset }],
    } = grids.get(node)!;
    const parentLeftOffset = parentRightOffset - width;

    this.positions.set(node, { offset: parentLeftOffset + leftOffset, level });

    if (!node.left.isNil) {
      this.buildPositionsForLeftNode(
        node.left,
        parentLeftOffset,
        level + 1,
        grids,
      );
    }

    if (!node.right.isNil) {
      this.buildPositionsForRightNode(
        node.right,
        parentRightOffset,
        level + 1,
        grids,
      );
    }
  }
}
