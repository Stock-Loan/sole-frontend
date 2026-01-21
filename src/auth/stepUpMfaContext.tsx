import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { verifyStepUpMfa } from "./api";
import type { StepUpChallengeResponse, StepUpMfaContextValue } from "./types";
import type { PendingStepUpRequest, StepUpChallengeData } from "@/shared/api/types";
import { apiClient, setStepUpHandler } from "@/shared/api/http";

const StepUpMfaContext = createContext<StepUpMfaContextValue | undefined>(
	undefined,
);

export function useStepUpMfa() {
	const ctx = useContext(StepUpMfaContext);
	if (!ctx) {
		throw new Error("useStepUpMfa must be used within a StepUpMfaProvider");
	}
	return ctx;
}

export function useStepUpMfaOptional() {
	return useContext(StepUpMfaContext);
}

interface StepUpMfaProviderProps {
	children: ReactNode;
}

export function StepUpMfaProvider({ children }: StepUpMfaProviderProps) {
	const [challenge, setChallenge] = useState<StepUpChallengeResponse | null>(
		null,
	);
	const [pendingRequest, setPendingRequest] = useState<PendingStepUpRequest | null>(
		null,
	);
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const requestStepUpRef = useRef<((challenge: StepUpChallengeData, request: PendingStepUpRequest) => void) | null>(null);

	const requestStepUp = useCallback(
		(
			challengeData: StepUpChallengeData,
			request: PendingStepUpRequest,
		) => {
			setChallenge(challengeData);
			setPendingRequest(request);
			setError(null);
		},
		[],
	);

	// Keep ref updated with latest callback
	requestStepUpRef.current = requestStepUp;

	// Register with API client on mount
	useEffect(() => {
		setStepUpHandler((challenge, request) => {
			requestStepUpRef.current?.(challenge, request);
		});
		return () => {
			setStepUpHandler(null);
		};
	}, []);

	const verifyStepUp = useCallback(
		async (code: string) => {
			if (!challenge || !pendingRequest) {
				throw new Error("No pending step-up challenge");
			}

			setIsVerifying(true);
			setError(null);

			try {
				const result = await verifyStepUpMfa({
					challenge_token: challenge.challenge_token,
					code,
				});

				// Retry the original request with the step-up token
				const existingHeaders = (pendingRequest.config.headers ?? {}) as Record<string, string>;
				const newConfig = {
					...pendingRequest.config,
					headers: {
						...existingHeaders,
						"X-Step-Up-Token": result.step_up_token,
					},
				};

				const response = await apiClient.request(newConfig);
				pendingRequest.resolve(response);

				// Clear state
				setChallenge(null);
				setPendingRequest(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Verification failed";
				setError(message);
				throw err;
			} finally {
				setIsVerifying(false);
			}
		},
		[challenge, pendingRequest],
	);

	const cancelStepUp = useCallback(() => {
		if (pendingRequest) {
			pendingRequest.reject(new Error("Step-up MFA cancelled by user"));
		}
		setChallenge(null);
		setPendingRequest(null);
		setError(null);
	}, [pendingRequest]);

	const value = useMemo<StepUpMfaContextValue>(
		() => ({
			isStepUpRequired: challenge !== null,
			challenge,
			pendingRequest,
			requestStepUp,
			verifyStepUp,
			cancelStepUp,
			isVerifying,
			error,
		}),
		[
			challenge,
			pendingRequest,
			requestStepUp,
			verifyStepUp,
			cancelStepUp,
			isVerifying,
			error,
		],
	);

	return (
		<StepUpMfaContext.Provider value={value}>
			{children}
		</StepUpMfaContext.Provider>
	);
}
