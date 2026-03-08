import RBTNode from "../RBT/RBTNode";
import Snapshot, { type OperationNode } from "./Snapshot";
import type { SnapshotType } from "./SnapshotType";

export default class SnapshotHistory {
  private snapshots: Snapshot[];

  constructor(
    root: RBTNode | null,
    type: SnapshotType,
    firstNode: RBTNode,
    ...restNodes: RBTNode[]
  ) {
    this.snapshots = [
      new Snapshot(root, {
        type,
        nodes: SnapshotHistory.toValueNodes(firstNode, restNodes),
      }),
    ];
  }

  record(
    root: RBTNode | null,
    type: SnapshotType,
    firstNode: RBTNode,
    ...restNodes: RBTNode[]
  ) {
    this.snapshots.push(
      new Snapshot(root, {
        type,
        nodes: SnapshotHistory.toValueNodes(firstNode, restNodes),
      }),
    );
  }

  private static toValueNodes(
    first: RBTNode,
    rest: RBTNode[],
  ): [OperationNode, ...OperationNode[]] {
    return [
      { value: first.value, red: first.red },
      ...rest.map((n) => ({ value: n.value, red: n.red })),
    ];
  }

  getSnapshot(index: number): Snapshot | null {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index];
  }

  get length(): number {
    return this.snapshots.length;
  }
}
