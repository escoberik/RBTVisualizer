export type EventType =
  | "COMPARE_LEFT"
  | "COMPARE_RIGHT"
  | "INSERT"
  | "ROTATE_LEFT"
  | "ROTATE_RIGHT"
  | "RECOLOR_UNCLE_RED"
  | "RECOLOR_AFTER_ROTATION"
  | "RECOLOR_ROOT";

export type LogFn<T> = (event: EventType, root: T, subject: T) => void;

export interface NodePosition {
  offset: number;
  level: number;
}
