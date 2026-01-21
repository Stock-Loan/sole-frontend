import { useContext } from "react";
import { InactivityContext } from "../inactivityContextDef";
import type { InactivityContextValue } from "../types";

export function useInactivity(): InactivityContextValue {
	const ctx = useContext(InactivityContext);
	if (!ctx) {
		throw new Error("useInactivity must be used within an InactivityProvider");
	}
	return ctx;
}

export function useInactivityOptional(): InactivityContextValue | undefined {
	return useContext(InactivityContext);
}
