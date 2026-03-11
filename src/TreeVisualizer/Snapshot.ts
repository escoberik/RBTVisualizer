import type RBTNode from "../RBT/Node";
import type { SnapshotType } from "./SnapshotType";

export type OperationNode = { value: number; red: boolean };

interface Operation {
  type: SnapshotType;
  readonly nodes: readonly [OperationNode, ...OperationNode[]];
}

type DescriptionFn = (
  o: readonly [OperationNode, ...OperationNode[]],
) => string;

const DESCRIPTIONS: Record<SnapshotType, DescriptionFn> = {
  new: (o) => `Created new RED node with value: ${o[0].value}`,
  inserted_root: (o) => `Inserted ${o[0].value} as root`,
  inserting_under: (o) => `Inserting ${o[0].value} under ${o[1].value}`,
  comparing_left: (o) => `${o[0].value} < ${o[1].value}, going left`,
  comparing_right: (o) => `${o[0].value} >= ${o[1].value}, going right`,
  inserted_left: (o) => `Inserted ${o[0].value} as left child of ${o[1].value}`,
  inserted_right: (o) =>
    `Inserted ${o[0].value} as right child of ${o[1].value}`,
  recolored: (o) =>
    `Repainted parent ${o[0].value} and uncle ${o[1].value} black`,
  recolored_grandparent: (o) => `Repainted grandparent ${o[0].value} red`,
  rotated_left: (o) => `Left rotation on ${o[0].value}`,
  rotated_right: (o) => `Right rotation on ${o[0].value}`,
  recolored_after_rotation: (o) =>
    `Repainted ${o[0].value} black and ${o[1].value} red`,
  repainted_root: (o) => `Repainted root ${o[0].value} black`,
};

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

  get isInsertingUnder(): boolean {
    return this.operation.type === "inserting_under";
  }

  get isRepaintedRoot(): boolean {
    return this.operation.type === "repainted_root";
  }

  get isComparingLeft(): boolean {
    return this.operation.type === "comparing_left";
  }

  get isComparingRight(): boolean {
    return this.operation.type === "comparing_right";
  }

  get isInsertedLeft(): boolean {
    return this.operation.type === "inserted_left";
  }

  get isInsertedRight(): boolean {
    return this.operation.type === "inserted_right";
  }

  get isRotatedLeft(): boolean {
    return this.operation.type === "rotated_left";
  }

  get isRotatedRight(): boolean {
    return this.operation.type === "rotated_right";
  }

  get description(): string {
    return DESCRIPTIONS[this.operation.type](this.operation.nodes);
  }
}
