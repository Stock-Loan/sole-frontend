import { useContext, createContext } from "react";
import type { StepUpMfaContextValue } from "../types";

export function useStepUpMfa(): StepUpMfaContextValue {
	const ctx = useContext(StepUpMfaContext);
	if (!ctx) {
		throw new Error("useStepUpMfa must be used within a StepUpMfaProvider");
	}
	return ctx;
}

export function useStepUpMfaOptional(): StepUpMfaContextValue | undefined {
	return useContext(StepUpMfaContext);
}

export const StepUpMfaContext = createContext<
	StepUpMfaContextValue | undefined
>(undefined);
