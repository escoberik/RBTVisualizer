import Node from "./Node";
import type { NodePosition } from "./types";

class GridLine {
  constructor(
    public readonly leftOffset: number,
    private _width: number,
    public readonly rightOffset: number,
  ) {}

  get width(): number {
    return this._width;
  }

  get length(): number {
    return this.leftOffset + this.width + this.rightOffset;
  }

  concat(other: GridLine): GridLine {
    return new GridLine(
      this.leftOffset,
      this.width + other.width + 1,
      other.rightOffset,
    );
  }

  setLength(length: number) {
    this._width = length - this.leftOffset - this.rightOffset;
  }
}

class Grid {
  constructor(public readonly lines: GridLine[]) {}

  get width(): number {
    return this.lines[0].length;
  }
  get height(): number {
    return this.lines.length;
  }

  static readonly BLANK = new Grid([new GridLine(1, 0, 1)]);
  static readonly LEAF = new Grid([new GridLine(0, 1, 0)]);

  static merge(left: Grid, right: Grid): Grid {
    if (left.height > right.height) {
      const [diff, matchingLeft] = left.splitToMatch(right);
      return Grid.merge(matchingLeft, right).appendLeft(diff);
    }

    if (right.height > left.height) {
      const [diff, matchingRight] = right.splitToMatch(left);
      return Grid.merge(left, matchingRight).appendRight(diff);
    }

    const baseLine = left.lines[left.height - 1].concat(
      right.lines[right.height - 1],
    );
    const mergedLines: GridLine[] = [baseLine];

    for (let i = left.height - 2; i >= 0; i--) {
      const line = left.lines[i].concat(right.lines[i]);
      if (line.length > baseLine.length) {
        baseLine.setLength(line.length);
      } else {
        line.setLength(baseLine.length);
      }
      mergedLines.push(line);
    }

    const tip = mergedLines[mergedLines.length - 1].length;
    if (tip % 2 === 0) {
      if (left.width > right.width) {
        mergedLines.push(new GridLine(tip / 2, 1, tip / 2 - 1));
      } else {
        mergedLines.push(new GridLine(tip / 2 - 1, 1, tip / 2));
      }
    } else {
      mergedLines.push(new GridLine((tip - 1) / 2, 1, (tip - 1) / 2));
    }

    mergedLines.reverse();
    return new Grid(mergedLines);
  }

  splitToMatch(other: Grid): [Grid, Grid] {
    const matchingLines = this.lines.slice(0, other.height);
    const diffLines = this.lines.slice(other.height);
    return [new Grid(diffLines), new Grid(matchingLines)];
  }

  appendLeft(other: Grid): Grid {
    const lines = other.lines.map(
      (line) =>
        new GridLine(
          line.leftOffset,
          line.width,
          line.rightOffset + this.width - line.length,
        ),
    );
    return new Grid(this.lines.concat(lines));
  }

  appendRight(other: Grid): Grid {
    const lines = other.lines.map(
      (line) =>
        new GridLine(
          line.leftOffset + this.width - line.length,
          line.width,
          line.rightOffset,
        ),
    );
    return new Grid(this.lines.concat(lines));
  }
}

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
