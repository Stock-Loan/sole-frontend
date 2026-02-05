export const PENDING_EMAIL_KEY = "sole.pending-login-email";
export const PENDING_ORG_SWITCH_KEY = "sole.pending-org-switch";
export const REMEMBER_DEVICE_KEY = "sole.mfa.remember-device";

/** Warning starts 60 seconds before timeout */
export const WARNING_SECONDS = 60;

/** Activity events to track */
export const ACTIVITY_EVENTS = [
	"mousedown",
	"mousemove",
	"keydown",
	"scroll",
	"touchstart",
	"click",
] as const;

/** Throttle activity updates to avoid excessive state changes */
export const ACTIVITY_THROTTLE_MS = 1000;

export const ACTION_LABELS: Record<string, string> = {
	STOCK_GRANT_ASSIGNMENT: "Stock Grant Assignment",
	LOAN_SUBMISSION: "Loan Submission",
	LOAN_PAYMENT_RECORD: "Loan Payment Recording",
	WORKFLOW_COMPLETE: "Workflow Completion",
	ORG_SETTINGS_CHANGE: "Organization Settings Change",
	USER_PROFILE_EDIT: "User Profile Edit",
	ROLE_ASSIGNMENT: "Role Assignment",
	ACL_ASSIGNMENT: "ACL Assignment",
	LOGIN: "Login",
	RECOVERY_CODES_REGENERATE: "Recovery Codes Regeneration",
	USER_MFA_RESET: "User MFA Reset",
	SELF_MFA_RESET: "MFA Deactivation",
};

// Actions that allow recovery code as an alternative
export const RECOVERY_CODE_ALLOWED_ACTIONS = new Set([
	"LOGIN",
	"SELF_MFA_RESET",
	"USER_MFA_RESET",
	"RECOVERY_CODES_REGENERATE",
]);

export const authKeys = {
	me: () => ["auth", "me"] as const,
	selfProfile: () => ["auth", "self-profile"] as const,
	selfContext: (orgId?: string | null) =>
		["auth", "self-context", orgId ?? "current"] as const,
};
