import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { retryRequestWithStepUpToken, verifyStepUpMfa } from "./api";
import type {
	StepUpChallengeResponse,
	StepUpMfaContextValue,
	StepUpMfaProviderProps,
} from "./types";
import type {
	PendingStepUpRequest,
	StepUpChallengeData,
} from "@/shared/api/types";
import { setStepUpHandler } from "@/shared/api/http";
import { StepUpMfaContext } from "@/auth/hooks/useStepUpMfa";

export function StepUpMfaProvider({ children }: StepUpMfaProviderProps) {
	const [challenge, setChallenge] = useState<StepUpChallengeResponse | null>(
		null,
	);
	const [pendingRequest, setPendingRequest] =
		useState<PendingStepUpRequest | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const requestStepUpRef = useRef<
		| ((challenge: StepUpChallengeData, request: PendingStepUpRequest) => void)
		| null
	>(null);

	const requestStepUp = useCallback(
		(challengeData: StepUpChallengeData, request: PendingStepUpRequest) => {
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
		async (code: string, codeType: "totp" | "recovery" = "totp") => {
			if (!challenge || !pendingRequest) {
				throw new Error("No pending step-up challenge");
			}

			setIsVerifying(true);
			setError(null);

			try {
				const result = await verifyStepUpMfa({
					challenge_token: challenge.challenge_token,
					code,
					code_type: codeType,
				});

				// Retry the original request with the step-up token
				const response = await retryRequestWithStepUpToken(
					pendingRequest.config as Record<string, unknown>,
					result.step_up_token,
				);
				pendingRequest.resolve({ data: response });

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
