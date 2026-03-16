export type EventType =
  | "INSERT"
  | "ROTATE_LEFT"
  | "ROTATE_RIGHT"
  | "RECOLOR_UNCLE_RED"
  | "RECOLOR_AFTER_ROTATION"
  | "RECOLOR_ROOT"
  | "COMPARE_LEFT"
  | "COMPARE_RIGHT"
  | "FOUND"
  | "NOT_FOUND"
  | "REPLACE_WITH_SUCCESSOR"
  | "DELETE"
  | "RECOLOR_SIBLING"
  | "RECOLOR_ABSORBED";

export type LogFn<T> = (event: EventType, root: T, subject: T) => void;

export interface NodePosition {
  offset: number;
  level: number;
}
