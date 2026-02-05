import type { UseFormReturn } from "react-hook-form";

export type RoleCode = string;

export interface TokenPair {
	access_token: string;
	token_type: "bearer";
	refresh_token?: string;
	csrf_token?: string | null;
}

export interface AuthUser {
	id: string;
	org_id?: string;
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	mfa_enabled?: boolean;
	full_name?: string | null;
	roles?: RoleCode[];
	orgIds?: string[];
	permissions?: string[];
	must_change_password?: boolean;
}

export interface AuthContextValue {
	user: AuthUser | null;
	tokens: TokenPair | null;
	isAuthenticating: boolean;
	setSession: (tokens: TokenPair, user: AuthUser) => void;
	setSessionForOrg: (orgId: string, tokens: TokenPair, user: AuthUser) => void;
	setUser: (user: AuthUser | null) => void;
	clearSession: () => void;
	logout: () => Promise<void>;
	hasAnyRole: (roles?: RoleCode[]) => boolean;
	getTokensForOrg: (orgId?: string | null) => TokenPair | null;
}

export interface LoginStartPayload {
	email: string;
}

export interface OrgDiscoveryPayload {
	email: string;
}

export interface OrgDiscoveryOrg {
	org_id: string;
	name: string;
	slug?: string;
}

export interface OrgDiscoveryResponse {
	orgs: OrgDiscoveryOrg[];
}

export interface LoginEmailFormValues {
	email: string;
}

export interface LoginStartResponse {
	challenge_token: string;
}

export interface LoginCompletePayload {
	challenge_token: string;
	password: string;
	remember_device_token?: string | null;
}

export interface LoginCompleteResponse {
	access_token?: string;
	token_type?: "bearer";
	refresh_token?: string;
	csrf_token?: string | null;
	mfa_required?: boolean;
	mfa_setup_required?: boolean;
	mfa_token?: string | null;
	setup_token?: string | null;
	remember_device_days?: number | null;
}

export interface LoginMfaPayload {
	mfa_token: string;
	code: string;
	remember_device?: boolean;
}

export interface LoginMfaResponse extends TokenPair {
	remember_device_token?: string | null;
}

export interface MfaSetupCompleteResponse extends TokenPair {
	remember_device_token?: string | null;
	recovery_codes: string[];
}

export interface LoginMfaRecoveryPayload {
	mfa_token: string;
	recovery_code: string;
}

export interface LoginMfaSetupStartPayload {
	setup_token: string;
}

export interface LoginMfaSetupVerifyPayload {
	setup_token: string;
	code: string;
	remember_device?: boolean;
}

export interface MfaSetupStartResponse {
	secret: string;
	otpauth_url: string;
	issuer: string;
	account: string;
	remember_device_days?: number | null;
}

export interface MfaSetupVerifyPayload {
	code: string;
	remember_device?: boolean;
}

export interface LoginPasswordFormValues {
	password: string;
}

export interface LoginMfaFormValues {
	code: string;
	remember_device?: boolean;
}

export interface LoginResponse {
	tokens: TokenPair;
	user: AuthUser;
}

export interface PersistedSession {
	user: AuthUser | null;
	tokens: TokenPair | null;
	tokensByOrgId?: Record<string, TokenPair>;
}

export interface SelfContextResponse {
	org: {
		id: string;
		name: string;
		slug?: string;
		status?: string;
	};
	roles: Array<{
		id: string;
		name?: string;
		is_system_role?: boolean;
		permissions?: string[];
	}>;
	permissions: string[];
	session_timeout_minutes: number;
	tenancy_mode: "single" | "multi";
}

export interface ChangePasswordPayload {
	current_password: string;
	new_password: string;
}

export interface ChangePasswordFormValues {
	current_password: string;
	new_password: string;
	confirm_password: string;
}
export type RememberDeviceMap = Record<string, string>;

// Recovery codes types
export interface RecoveryCodesCountResponse {
	remaining_count: number;
}

export interface RegenerateRecoveryCodesResponse {
	recovery_codes: string[];
}

export interface AdminMfaResetResponse {
	message: string;
}

export interface MfaEnrollmentPageProps {
	form: UseFormReturn<LoginMfaFormValues>;
	issuer?: string | null;
	account?: string | null;
	secret?: string | null;
	otpauthUrl?: string | null;
	showRememberDevice?: boolean;
	isSubmitting: boolean;
	onSubmit: (values: LoginMfaFormValues) => void;
	onReset: () => void;
	resetLabel?: string;
}

export interface OtpInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	length?: number;
	autoFocus?: boolean;
	className?: string;
	inputClassName?: string;
}

// Step-up MFA types
export interface StepUpChallengeResponse {
	step_up_required: boolean;
	challenge_token: string;
	action: string;
}

export interface StepUpVerifyPayload {
	challenge_token: string;
	code: string;
	code_type?: "totp" | "recovery";
}

export interface StepUpVerifyResponse {
	step_up_token: string;
	action: string;
	expires_in_seconds: number;
}

// Re-export shared types for convenience
export type {
	PendingStepUpRequest,
	StepUpChallengeData,
} from "@/shared/api/types";

export interface StepUpMfaContextValue {
	isStepUpRequired: boolean;
	challenge: StepUpChallengeResponse | null;
	pendingRequest: import("@/shared/api/types").PendingStepUpRequest | null;
	requestStepUp: (
		challenge: import("@/shared/api/types").StepUpChallengeData,
		request: import("@/shared/api/types").PendingStepUpRequest,
	) => void;
	verifyStepUp: (code: string, codeType?: "totp" | "recovery") => Promise<void>;
	cancelStepUp: () => void;
	isVerifying: boolean;
	error: string | null;
}

export interface StepUpMfaProviderProps {
	children: import("react").ReactNode;
}

export interface InactivityContextValue {
	/** Time in seconds until session expires */
	secondsRemaining: number | null;
	/** Whether the warning countdown is visible */
	isWarningVisible: boolean;
	/** Session timeout in minutes from org settings */
	sessionTimeoutMinutes: number;
	/** Manually refresh activity (extends session) */
	refreshActivity: () => void;
	/** Whether activity refresh is in progress */
	isRefreshing: boolean;
}

export interface InactivityProviderProps {
	children: import("react").ReactNode;
}

export interface RecoveryCodesDisplayProps {
	recoveryCodes: string[];
	onContinue: () => void;
	isLoggedIn?: boolean;
}
