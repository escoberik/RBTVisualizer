import type RBTNode from "../RBT/RBTNode";
import Snapshot, { type OperationNode } from "./Snapshot";
import type { SnapshotType } from "./SnapshotType";

export default class SnapshotHistory {
  private snapshots: Snapshot[];

  constructor(
    root: RBTNode | null,
    type: SnapshotType,
    firstNode: OperationNode,
    ...restNodes: OperationNode[]
  ) {
    this.snapshots = [
      new Snapshot(root, {
        type,
        nodes: [firstNode, ...restNodes],
      }),
    ];
  }

  record(
    root: RBTNode | null,
    type: SnapshotType,
    firstNode: OperationNode,
    ...restNodes: OperationNode[]
  ) {
    this.snapshots.push(
      new Snapshot(root, {
        type,
        nodes: [firstNode, ...restNodes],
      }),
    );
  }

  getSnapshot(index: number): Snapshot | null {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index];
  }

  get length(): number {
    return this.snapshots.length;
  }
}
