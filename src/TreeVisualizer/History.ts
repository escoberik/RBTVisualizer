import { EventType as RBTEventType } from "../RBT/types";
import type Node from "../RBT/Node";
import Layout from "./Layout";

type EventType = RBTEventType | "INITIAL";

const EventDescriptions: Record<EventType, string> = {
  INITIAL: "Initial tree",
  INSERT: "Insert node",
};

export default class History<T> {
  private _layouts: Layout<T>[] = [];
  // The viewBox must stay stable while stepping through history — use the
  // largest width and height across all layouts so it never shrinks mid-replay.
  private _size: { width: number; height: number } = { width: 0, height: 0 };

  get size() {
    return this._size;
  }
  get length() {
    return this._layouts.length;
  }

  get(index: number): Layout<T> | undefined {
    return this._layouts[index];
  }

  append(event: RBTEventType, root: Node<T>) {
    const layout = new Layout<T>(EventDescriptions[event], root);
    this._layouts.push(layout);
    this._size = {
      width: Math.max(this._size.width, layout.size.width),
      height: Math.max(this._size.height, layout.size.height),
    };
  }

  reset(root: Node<T>) {
    const initial = new Layout<T>(EventDescriptions.INITIAL, root);
    this._layouts = [initial];
    this._size = { width: initial.size.width, height: initial.size.height };
  }
}
