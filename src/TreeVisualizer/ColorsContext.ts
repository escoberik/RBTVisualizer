import { createContext, useContext } from "react";
import { colors } from "./colors";
import type { NodeColors } from "./types";

export const ColorsContext = createContext<NodeColors>(
  colors as unknown as NodeColors,
);
export const useColors = () => useContext(ColorsContext);
