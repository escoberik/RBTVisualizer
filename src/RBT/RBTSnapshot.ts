import RBTNode from "./RBTNode";
import RBTree from "./RBTree";

export type OperationType =
  | "start"
  | "create node"
  | "inserting"
  | "inserted_root"
  | "comparing_left"
  | "comparing_right"
  | "inserted_left"
  | "inserted_right"
  | "recolored"
  | "recolored_grandparent"
  | "rotated_left"
  | "rotated_right"
  | "recolored_after_rotation"
  | "repainted_root";

export interface Operation {
  type: OperationType;
  nodes: RBTNode[];
}

export default class RBTSnapshot {
  constructor(
    readonly tree: RBTree,
    readonly operation: Operation,
  ) {}

  get nodes(): RBTNode[] {
    return this.operation.nodes;
  }

  get description(): string {
    const { type, nodes } = this.operation;
    switch (type) {
      case "start":
        return "Initial empty tree";
      case "create node":
        return `Created new RED node with value: ${nodes[0].value}`;
      case "inserting":
        return `Inserting ${nodes[0].value}`;
      case "inserted_root":
        return `Inserted ${nodes[0].value} as root`;
      case "comparing_left":
        return `${nodes[0].value} < ${nodes[1].value}, going left`;
      case "comparing_right":
        return `${nodes[0].value} >= ${nodes[1].value}, going right`;
      case "inserted_left":
        return `Inserted ${nodes[0].value} as left child of ${nodes[1].value}`;
      case "inserted_right":
        return `Inserted ${nodes[0].value} as right child of ${nodes[1].value}`;
      case "recolored":
        return `Repainted parent ${nodes[0].value} and uncle ${nodes[1].value} black`;
      case "recolored_grandparent":
        return `Repainted grandparent ${nodes[0].value} red`;
      case "rotated_left":
        return `Left rotation on ${nodes[0].value}`;
      case "rotated_right":
        return `Right rotation on ${nodes[0].value}`;
      case "recolored_after_rotation":
        return `Repainted ${nodes[0].value} black and ${nodes[1].value} red`;
      case "repainted_root":
        return `Repainted root ${nodes[0].value} black`;
    }
  }
}
