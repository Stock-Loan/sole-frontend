import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InactivityContext } from "./inactivityContextDef";
import type { InactivityContextValue, InactivityProviderProps } from "./types";
import { refreshSession } from "./api";
import { useSelfContext, useAuth } from "./hooks/hooks";
import { useTenant } from "@/features/tenancy/hooks";

/** Warning starts 60 seconds before timeout */
const WARNING_SECONDS = 60;

/** Activity events to track */
const ACTIVITY_EVENTS = [
	"mousedown",
	"mousemove",
	"keydown",
	"scroll",
	"touchstart",
	"click",
] as const;

/** Throttle activity updates to avoid excessive state changes */
const ACTIVITY_THROTTLE_MS = 1000;

export function InactivityProvider({ children }: InactivityProviderProps) {
	const { tokens, setSession, user, clearSession } = useAuth();
	const { currentOrgId } = useTenant();
	const { data: selfContext, isLoading: isContextLoading } = useSelfContext();

	const sessionTimeoutMinutes = selfContext?.session_timeout_minutes ?? 5;
	const sessionTimeoutMs = sessionTimeoutMinutes * 60 * 1000;
	// Ensure warning time is at least 0 (for very short timeouts)
	const warningTimeMs = Math.max(0, sessionTimeoutMs - WARNING_SECONDS * 1000);

	const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
	const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
	const [isWarningVisible, setIsWarningVisible] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const lastActivityRef = useRef(lastActivityTime);
	const throttleRef = useRef<number>(0);
	const prevIsLoggedIn = useRef(false);
	const isLoggedIn = Boolean(tokens?.access_token && user);

	// Reset activity time when user logs in
	useEffect(() => {
		if (isLoggedIn && !prevIsLoggedIn.current) {
			// User just logged in - reset activity time
			const now = Date.now();
			setLastActivityTime(now);
			lastActivityRef.current = now;
		}
		prevIsLoggedIn.current = isLoggedIn;
	}, [isLoggedIn]);

	// Update ref when state changes
	lastActivityRef.current = lastActivityTime;

	const handleActivity = useCallback(() => {
		if (!isLoggedIn) return;

		const now = Date.now();
		// Throttle activity updates
		if (now - throttleRef.current < ACTIVITY_THROTTLE_MS) return;
		throttleRef.current = now;

		setLastActivityTime(now);
		// If warning was visible, hide it (user became active)
		if (isWarningVisible) {
			setIsWarningVisible(false);
			setSecondsRemaining(null);
		}
	}, [isLoggedIn, isWarningVisible]);

	// Register activity listeners
	useEffect(() => {
		if (!isLoggedIn) return;

		for (const event of ACTIVITY_EVENTS) {
			window.addEventListener(event, handleActivity, { passive: true });
		}

		return () => {
			for (const event of ACTIVITY_EVENTS) {
				window.removeEventListener(event, handleActivity);
			}
		};
	}, [isLoggedIn, handleActivity]);

	// Main timer to check inactivity
	useEffect(() => {
		// Don't start timer until context is loaded and user is logged in
		if (!isLoggedIn || isContextLoading) {
			setIsWarningVisible(false);
			setSecondsRemaining(null);
			return;
		}

		const interval = setInterval(() => {
			const now = Date.now();
			const elapsed = now - lastActivityRef.current;

			if (elapsed >= sessionTimeoutMs) {
				// Session expired - log out
				clearSession();
				setIsWarningVisible(false);
				setSecondsRemaining(null);
			} else if (elapsed >= warningTimeMs) {
				// Show warning with countdown
				setIsWarningVisible(true);
				const remaining = Math.ceil((sessionTimeoutMs - elapsed) / 1000);
				setSecondsRemaining(Math.max(0, remaining));
			} else {
				// Normal state
				setIsWarningVisible(false);
				setSecondsRemaining(null);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [
		isLoggedIn,
		isContextLoading,
		sessionTimeoutMs,
		warningTimeMs,
		clearSession,
	]);

	const refreshActivity = useCallback(async () => {
		if (!tokens?.refresh_token || !currentOrgId || isRefreshing) return;

		setIsRefreshing(true);
		try {
			const newTokens = await refreshSession(
				tokens.refresh_token,
				currentOrgId,
			);
			if (newTokens && user) {
				setSession(
					{
						access_token: newTokens.access_token,
						refresh_token: newTokens.refresh_token,
						token_type: "bearer",
					},
					user,
				);
			}
			setLastActivityTime(Date.now());
			setIsWarningVisible(false);
			setSecondsRemaining(null);
		} catch {
			// If refresh fails, clear session
			clearSession();
		} finally {
			setIsRefreshing(false);
		}
	}, [tokens, currentOrgId, isRefreshing, setSession, user, clearSession]);

	const value = useMemo<InactivityContextValue>(
		() => ({
			secondsRemaining,
			isWarningVisible,
			sessionTimeoutMinutes,
			refreshActivity,
			isRefreshing,
		}),
		[
			secondsRemaining,
			isWarningVisible,
			sessionTimeoutMinutes,
			refreshActivity,
			isRefreshing,
		],
	);

	return (
		<InactivityContext.Provider value={value}>
			{children}
		</InactivityContext.Provider>
	);
}
