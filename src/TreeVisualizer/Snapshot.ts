import type RBTNode from "../RBT/RBTNode";
import type { SnapshotType } from "./SnapshotType";

export type OperationNode = { value: number; red: boolean };

interface Operation {
  type: SnapshotType;
  readonly nodes: readonly [OperationNode, ...OperationNode[]];
}

export default class Snapshot {
  constructor(
    readonly root: RBTNode | null,
    private readonly operation: Operation,
  ) {}

  get operands(): readonly [OperationNode, ...OperationNode[]] {
    return this.operation.nodes;
  }

  get isNew(): boolean {
    return this.operation.type === "new";
  }

  get isInsertedRoot(): boolean {
    return this.operation.type === "inserted_root";
  }

  get isRepaintedRoot(): boolean {
    return this.operation.type === "repainted_root";
  }

  get description(): string {
    const { type, nodes: operands } = this.operation;
    switch (type) {
      case "new":
        return `Created new RED node with value: ${operands[0].value}`;
      case "inserted_root":
        return `Inserted ${operands[0].value} as root`;
      case "comparing_left":
        return `${operands[0].value} < ${operands[1].value}, going left`;
      case "comparing_right":
        return `${operands[0].value} >= ${operands[1].value}, going right`;
      case "inserted_left":
        return `Inserted ${operands[0].value} as left child of ${operands[1].value}`;
      case "inserted_right":
        return `Inserted ${operands[0].value} as right child of ${operands[1].value}`;
      case "recolored":
        return `Repainted parent ${operands[0].value} and uncle ${operands[1].value} black`;
      case "recolored_grandparent":
        return `Repainted grandparent ${operands[0].value} red`;
      case "rotated_left":
        return `Left rotation on ${operands[0].value}`;
      case "rotated_right":
        return `Right rotation on ${operands[0].value}`;
      case "recolored_after_rotation":
        return `Repainted ${operands[0].value} black and ${operands[1].value} red`;
      case "repainted_root":
        return `Repainted root ${operands[0].value} black`;
    }
  }
}
