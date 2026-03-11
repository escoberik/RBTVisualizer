export type EventType = "INSERT"
export type LogFn<T> = (event: EventType, node: T) => void;
export interface NodePosition {
  offset: number;
  level: number;
}

