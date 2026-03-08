export type OperationType =
  | "inserted_root"
  | "inserting_under"
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
