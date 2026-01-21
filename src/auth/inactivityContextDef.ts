import { createContext } from "react";
import type { InactivityContextValue } from "./types";

export const InactivityContext = createContext<
	InactivityContextValue | undefined
>(undefined);
