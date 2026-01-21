import type { AxiosRequestConfig } from "axios";

export type TokenResolver = () => string | null;

export type TokenUpdater = (tokens: {
	access_token: string;
	refresh_token: string;
}) => void;

export type VoidHandler = () => void;

export interface StepUpChallengeData {
	step_up_required: boolean;
	challenge_token: string;
	action: string;
}

export interface PendingStepUpRequest {
	config: AxiosRequestConfig;
	resolve: (value: unknown) => void;
	reject: (error: unknown) => void;
}

export type StepUpHandler = (
	challenge: StepUpChallengeData,
	request: PendingStepUpRequest,
) => void;
