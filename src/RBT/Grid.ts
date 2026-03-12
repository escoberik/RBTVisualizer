export class GridLine {
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
