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
}

export interface LoginStartPayload {
	email: string;
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
}

export interface LoginPasswordFormValues {
	password: string;
}

export interface LoginResponse {
	tokens: TokenPair;
	user: AuthUser;
}

export interface PersistedSession {
	user: AuthUser | null;
	tokens: TokenPair | null;
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
