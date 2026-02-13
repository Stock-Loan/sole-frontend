const COMMON_WEAK_PASSWORDS = new Set([
	"password",
	"password123",
	"admin123",
	"qwerty123",
	"changeme",
	"changeme123",
	"welcome123",
	"letmein",
]);

const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

function resolvePasswordMinLength() {
	const parsed = Number.parseInt(
		import.meta.env.VITE_PASSWORD_MIN_LENGTH ?? "",
		10,
	);
	if (Number.isFinite(parsed) && parsed > 0) return parsed;
	return 12;
}

export const PASSWORD_MIN_LENGTH = resolvePasswordMinLength();

export interface PasswordRequirementState {
	key: string;
	label: string;
	met: boolean;
}

export function getPasswordRequirementStates(
	password: string,
): PasswordRequirementState[] {
	const normalized = password.trim().toLowerCase();
	return [
		{
			key: "length",
			label: `At least ${PASSWORD_MIN_LENGTH} characters`,
			met: password.length >= PASSWORD_MIN_LENGTH,
		},
		{
			key: "lowercase",
			label: "At least one lowercase letter",
			met: /[a-z]/.test(password),
		},
		{
			key: "uppercase",
			label: "At least one uppercase letter",
			met: /[A-Z]/.test(password),
		},
		{
			key: "number",
			label: "At least one number",
			met: /\d/.test(password),
		},
		{
			key: "special",
			label: "At least one special character",
			met: SPECIAL_CHAR_REGEX.test(password),
		},
		{
			key: "common",
			label: "Not a common weak password",
			met: password.length > 0 && !COMMON_WEAK_PASSWORDS.has(normalized),
		},
	];
}

export function isPasswordPolicySatisfied(password: string) {
	return getPasswordRequirementStates(password).every((rule) => rule.met);
}

export function getPasswordPolicyProgress(password: string) {
	const states = getPasswordRequirementStates(password);
	const metCount = states.filter((rule) => rule.met).length;
	return {
		requirements: states,
		metCount,
		totalCount: states.length,
		percent: states.length ? Math.round((metCount / states.length) * 100) : 0,
	};
}

export const PASSWORD_POLICY_ERROR_MESSAGE = `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include uppercase, lowercase, number, and special character, and must not be a common weak password.`;
