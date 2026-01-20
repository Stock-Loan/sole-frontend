export type RoleCode = string;

export interface TokenPair {
	access_token: string;
	refresh_token: string;
	token_type: "bearer";
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
	refresh_token?: string;
	token_type?: "bearer";
	mfa_required?: boolean;
	mfa_setup_required?: boolean;
	mfa_token?: string | null;
	setup_token?: string | null;
}

export interface LoginMfaPayload {
	mfa_token: string;
	code: string;
	remember_device?: boolean;
}

export interface LoginMfaResponse extends TokenPair {
	remember_device_token?: string | null;
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
