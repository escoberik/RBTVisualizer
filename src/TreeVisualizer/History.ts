import { EventType as RBTEventType } from "../RBT/types";
import InternalNode from "../RBT/InternalNode";
import type Node from "../RBT/Node";
import Layout from "./Layout";

type EventType = RBTEventType | "INITIAL";

const EventDescriptions: Record<EventType, string> = {
  INITIAL:                "Initial tree",
  COMPARE_LEFT:           "Compare — go left",
  COMPARE_RIGHT:          "Compare — go right",
  INSERT:                 "Insert node",
  ROTATE_LEFT:            "Rotate left",
  ROTATE_RIGHT:           "Rotate right",
  RECOLOR_UNCLE_RED:      "Recolor — uncle is red",
  RECOLOR_AFTER_ROTATION: "Recolor after rotation",
  RECOLOR_ROOT:           "Recolor root",
};

export default class History<T> {
  private _layouts: Layout<T>[] = [];
  // The viewBox must stay stable while stepping through history — use the
  // largest width and height across all layouts so it never shrinks mid-replay.
  private _size: { width: number; height: number } = { width: 0, height: 0 };
  // Value currently being inserted — carried into every layout as the floating node.
  private _floatingValue: T | undefined;

  get size() {
    return this._size;
  }
  get length() {
    return this._layouts.length;
  }

  get(index: number): Layout<T> | undefined {
    return this._layouts[index];
  }

  append(event: RBTEventType, root: Node<T>, subject: Node<T>) {
    // subject is always InternalNode<T> — Tree never passes the sentinel here
    const highlightValue = (subject as InternalNode<T>).value;
    const showFloating = event === "COMPARE_LEFT" || event === "COMPARE_RIGHT";
    const layout = new Layout<T>(EventDescriptions[event], root, highlightValue, showFloating ? this._floatingValue : undefined);
    this._layouts.push(layout);
    this._size = {
      width: Math.max(this._size.width, layout.size.width),
      height: Math.max(this._size.height, layout.size.height),
    };
  }

  reset(root: Node<T>, floatingValue?: T) {
    this._floatingValue = floatingValue;
    const initial = new Layout<T>(EventDescriptions.INITIAL, root, undefined, floatingValue);
    this._layouts = [initial];
    this._size = { width: initial.size.width, height: initial.size.height };
  }
}
