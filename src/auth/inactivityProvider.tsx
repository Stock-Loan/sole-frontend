import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ACTIVITY_EVENTS,
	ACTIVITY_THROTTLE_MS,
	WARNING_SECONDS,
} from "./constants";
import { InactivityContext } from "./context";
import type {
	InactivityContextValue,
	InactivityProviderProps,
	TokenPair,
} from "./types";
import { refreshSession } from "./api";
import { useSelfContext, useAuth } from "./hooks";
import { useTenant } from "@/features/tenancy/hooks";
import { isRefreshAuthFailure } from "@/shared/api/refresh";

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
		if (!tokens?.access_token || !currentOrgId || isRefreshing) return;

		setIsRefreshing(true);
		try {
			const refreshed = await refreshSession(currentOrgId);
			if (refreshed?.access_token && user) {
				const nextTokens: TokenPair = {
					access_token: refreshed.access_token,
					token_type: "bearer" as const,
				};
				if (refreshed.csrf_token !== undefined) {
					nextTokens.csrf_token = refreshed.csrf_token;
				}
				setSession(nextTokens, user);
			}
			setLastActivityTime(Date.now());
			setIsWarningVisible(false);
			setSecondsRemaining(null);
		} catch (error) {
			// Only clear session for authentication failures, not transient outages.
			if (isRefreshAuthFailure(error)) {
				clearSession();
			}
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
