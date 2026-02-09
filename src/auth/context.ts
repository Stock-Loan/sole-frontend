import { createContext } from "react";
import type {
	AuthContextValue,
	ImpersonationContextValue,
	InactivityContextValue,
	StepUpMfaContextValue,
} from "@/auth/types";

// ─── Context Definitions ─────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(
	undefined,
);

export const ImpersonationContext = createContext<
	ImpersonationContextValue | undefined
>(undefined);

export const InactivityContext = createContext<
	InactivityContextValue | undefined
>(undefined);

export const StepUpMfaContext = createContext<
	StepUpMfaContextValue | undefined
>(undefined);
