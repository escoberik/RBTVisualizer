import { EventType as RBTEventType } from "../RBT/types";
import InternalNode from "../RBT/InternalNode";
import type Node from "../RBT/Node";
import Snapshot from "./rendering/Snapshot";

// LayoutEventType is a superset of RBTEventType. The visualizer layer can
// introduce events that don't exist in the RBT core — either by translating
// an RBT event based on context (e.g. FOUND → FOUND_DUPLICATE during insert),
// or by synthesizing new events entirely in future (e.g. multi-step rotations).
export type LayoutEventType = RBTEventType | "INITIAL" | "FOUND_DUPLICATE";

const EventDescriptions: Record<LayoutEventType, string> = {
  INITIAL:                "Initial tree",
  INSERT:                 "Insert node",
  ROTATE_LEFT:            "Rotate left",
  ROTATE_RIGHT:           "Rotate right",
  RECOLOR_UNCLE_RED:      "Recolor — uncle is red",
  RECOLOR_AFTER_ROTATION: "Recolor after rotation",
  RECOLOR_ROOT:           "Recolor root",
  COMPARE_LEFT:           "Compare — go left",
  COMPARE_RIGHT:          "Compare — go right",
  FOUND:                  "Found",
  FOUND_DUPLICATE:        "Found duplicate",
  NOT_FOUND:              "Not found",
  REPLACE_WITH_SUCCESSOR: "Replace with successor",
  DELETE:                 "Delete node",
  RECOLOR_SIBLING:        "Recolor sibling",
  RECOLOR_ABSORBED:       "Absorb extra black",
};

let _nextGeneration = 0;

export default class History<T> {
  // Incremented each time a new History is constructed so callers can
  // detect a full reset and skip the transition animation.
  readonly generation = ++_nextGeneration;
  private _layouts: Snapshot<T>[] = [];
  // The viewBox must stay stable while stepping through history — use the
  // largest width and height across all layouts so it never shrinks mid-replay.
  private _size: { width: number; height: number } = { width: 0, height: 0 };
  // Value currently being inserted or searched — carried into layouts as the floating node.
  private _floatingValue: T | undefined;
  private _mode: "insert" | "find" | "delete" = "find";

  get size() {
    return this._size;
  }
  get length() {
    return this._layouts.length;
  }

  get(index: number): Snapshot<T> | undefined {
    return this._layouts[index];
  }

  append(event: RBTEventType, root: Node<T>, subject: Node<T>) {
    // subject is always InternalNode<T> — Tree never passes the sentinel here
    const highlightValue = (subject as InternalNode<T>).value;
    // RBT fires FOUND for both "value exists during find" and "duplicate during
    // insert". Translate the latter so the UI can show a distinct description.
    const layoutEvent: LayoutEventType =
      event === "FOUND" && this._mode === "insert" ? "FOUND_DUPLICATE" : event;
    const showFloating = layoutEvent === "COMPARE_LEFT" || layoutEvent === "COMPARE_RIGHT"
      || layoutEvent === "FOUND" || layoutEvent === "FOUND_DUPLICATE"
      || layoutEvent === "REPLACE_WITH_SUCCESSOR";
    const layout = new Snapshot<T>(EventDescriptions[layoutEvent], root, highlightValue, showFloating ? this._floatingValue : undefined);
    this._layouts.push(layout);
    this._size = {
      width: Math.max(this._size.width, layout.size.width),
      height: Math.max(this._size.height, layout.size.height),
    };
  }

  appendFinal(description: string, root: Node<T>) {
    const layout = new Snapshot<T>(description, root, undefined, undefined);
    this._layouts.push(layout);
    this._size = {
      width: Math.max(this._size.width, layout.size.width),
      height: Math.max(this._size.height, layout.size.height),
    };
  }

  reset(root: Node<T>, floatingValue?: T, mode: "insert" | "find" | "delete" = "find") {
    this._floatingValue = floatingValue;
    this._mode = mode;
    const initial = new Snapshot<T>(EventDescriptions.INITIAL, root, undefined, floatingValue);
    this._layouts = [initial];
    this._size = { width: initial.size.width, height: initial.size.height };
  }
}
