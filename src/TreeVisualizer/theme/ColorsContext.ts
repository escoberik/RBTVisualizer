import { createContext, useContext } from "react";
import { resolveColors } from "./theme";
import type { NodeColors } from "./types";

export const ColorsContext = createContext<NodeColors>(resolveColors());
export const useColors = () => useContext(ColorsContext);
