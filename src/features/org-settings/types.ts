export interface SecuritySettings {
	requireMfaForAdmins?: boolean;
	inactivityTimeoutMinutes?: number;
	passwordRotationDays?: number;
}

export interface OrgSettings {
	orgId: string;
	allowExports?: boolean;
	allowProfileEdits?: boolean;
	retentionDays?: number;
	security?: SecuritySettings;
}
