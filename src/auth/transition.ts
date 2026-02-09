const AUTH_TRANSITION_KEY = "sole.auth.transition";
const AUTH_TRANSITION_TTL_MS = 30_000;

type AuthTransitionState = {
	kind: string;
	startedAt: number;
};

function readTransitionState(): AuthTransitionState | null {
	if (typeof sessionStorage === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(AUTH_TRANSITION_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as AuthTransitionState;
		if (!parsed?.startedAt) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function beginAuthTransition(kind: string): void {
	if (typeof sessionStorage === "undefined") return;
	try {
		const payload: AuthTransitionState = { kind, startedAt: Date.now() };
		sessionStorage.setItem(AUTH_TRANSITION_KEY, JSON.stringify(payload));
	} catch {
		// ignore storage errors
	}
}

export function clearAuthTransition(): void {
	if (typeof sessionStorage === "undefined") return;
	try {
		sessionStorage.removeItem(AUTH_TRANSITION_KEY);
	} catch {
		// ignore storage errors
	}
}

export function isAuthTransitionInProgress(): boolean {
	const state = readTransitionState();
	if (!state) return false;
	if (Date.now() - state.startedAt > AUTH_TRANSITION_TTL_MS) {
		clearAuthTransition();
		return false;
	}
	return true;
}
