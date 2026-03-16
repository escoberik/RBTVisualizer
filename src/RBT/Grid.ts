export class GridLine {
  constructor(
    public readonly leftOffset: number,
    private _width: number,
    public readonly rightOffset: number,
  ) {}

  static fromTopline(
    topLine: GridLine,
    leftWidth: number,
    rightWidth: number,
  ): GridLine {
    const { leftOffset, rightOffset } = topLine;

    // If the width is odd, we can just put the new line in the middle.
    const { length } = topLine;
    if (length % 2 != 0)
      return new GridLine((length - 1) / 2, 1, (length - 1) / 2);

    if (leftOffset !== rightOffset)
      return this.onTopOf(length, leftOffset > rightOffset);
    return this.onTopOf(length, leftWidth > rightWidth);
  }

  private static onTopOf(base: number, nudgeRight: boolean) {
    return new GridLine(
      Math.floor((base - 1) / 2) + (nudgeRight ? 1 : 0),
      1,
      Math.floor((base - 1) / 2) + (nudgeRight ? 0 : 1),
    );
  }

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

export class Grid {
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
    if (left === Grid.BLANK && right === Grid.BLANK) return Grid.LEAF;

    if (left === Grid.LEAF && right === Grid.BLANK) {
      return new Grid([new GridLine(1, 1, 0), new GridLine(0, 1, 1)]);
    }

    if (left === Grid.BLANK && right === Grid.LEAF) {
      return new Grid([new GridLine(0, 1, 1), new GridLine(1, 1, 0)]);
    }

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

    const top = mergedLines[mergedLines.length - 1];
    mergedLines.push(GridLine.fromTopline(top, left.width, right.width));

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
