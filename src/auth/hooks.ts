import { useContext } from "react";
import {
	useMutation,
	useQuery,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { canPermissions } from "@/app/permissions/can";
import { authKeys, REMEMBER_DEVICE_KEY } from "@/auth/constants";
import { useTenant } from "@/features/tenancy/hooks";
import {
	changePassword,
	changePasswordWithToken,
	getAuthOrgs,
	getMe,
	getSelfContext,
	login,
	mfaEnrollStart,
	mfaEnrollVerify,
	mfaSetupStart,
	mfaSetupVerify,
	mfaVerify,
	selectOrg,
} from "@/auth/api";
import {
	AuthContext,
	InactivityContext,
	StepUpMfaContext,
} from "@/auth/context";
import type {
	AuthOrgsResponse,
	AuthUser,
	ChangePasswordPayload,
	LoginPayload,
	LoginResponse,
	MfaEnrollStartPayload,
	MfaEnrollVerifyPayload,
	MfaSetupCompleteResponse,
	MfaSetupStartResponse,
	MfaSetupVerifyPayload,
	MfaVerifyPayload,
	MfaVerifyResponse,
	RememberDeviceMap,
	SelectOrgPayload,
	SelectOrgResponse,
} from "@/auth/types";

export function useAuthContext() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return ctx;
}

export function useAuth() {
	return useAuthContext();
}

export function useInactivity() {
	const ctx = useContext(InactivityContext);
	if (!ctx) {
		throw new Error("useInactivity must be used within an InactivityProvider");
	}
	return ctx;
}

export function useInactivityOptional() {
	return useContext(InactivityContext);
}

export function useStepUpMfa() {
	const ctx = useContext(StepUpMfaContext);
	if (!ctx) {
		throw new Error("useStepUpMfa must be used within a StepUpMfaProvider");
	}
	return ctx;
}

export function useStepUpMfaOptional() {
	return useContext(StepUpMfaContext);
}

export function useSelfContext() {
	const { tokens } = useAuth();
	const { currentOrgId } = useTenant();

	const query = useQuery({
		queryKey: authKeys.selfContext(currentOrgId),
		queryFn: getSelfContext,
		enabled: Boolean(tokens?.access_token && currentOrgId),
		staleTime: 5 * 60 * 1000,
	});

	return query;
}

export function useMe(
	options: Omit<UseQueryOptions<AuthUser>, "queryKey" | "queryFn"> = {},
) {
	const { tokens, user } = useAuth();

	return useQuery({
		queryKey: authKeys.me(),
		queryFn: getMe,
		enabled: options.enabled ?? Boolean(tokens?.access_token && !user),
		staleTime: 5 * 60 * 1000,
		...options,
	});
}

// ─── Identity-first login flow hooks ────────────────────────────────────────

export function useLogin() {
	return useMutation<LoginResponse, unknown, LoginPayload>({
		mutationFn: (payload) => login(payload),
	});
}

export function useAuthOrgs() {
	return useMutation<AuthOrgsResponse, unknown, string>({
		mutationFn: (preOrgToken) => getAuthOrgs(preOrgToken),
	});
}

export function useSelectOrg() {
	return useMutation<
		SelectOrgResponse,
		unknown,
		{ payload: SelectOrgPayload; preOrgToken: string }
	>({
		mutationFn: ({ payload, preOrgToken }) => selectOrg(payload, preOrgToken),
	});
}

export function useMfaVerify() {
	return useMutation<
		MfaVerifyResponse,
		unknown,
		{ payload: MfaVerifyPayload; preOrgToken: string }
	>({
		mutationFn: ({ payload, preOrgToken }) => mfaVerify(payload, preOrgToken),
	});
}

export function useMfaEnrollStart() {
	return useMutation<
		MfaSetupStartResponse,
		unknown,
		{ payload: MfaEnrollStartPayload; preOrgToken: string }
	>({
		mutationFn: ({ payload, preOrgToken }) =>
			mfaEnrollStart(payload, preOrgToken),
	});
}

export function useMfaEnrollVerify() {
	return useMutation<
		MfaSetupCompleteResponse,
		unknown,
		{ payload: MfaEnrollVerifyPayload; preOrgToken: string }
	>({
		mutationFn: ({ payload, preOrgToken }) =>
			mfaEnrollVerify(payload, preOrgToken),
	});
}

// ─── Post-login hooks ───────────────────────────────────────────────────────

export function useChangePassword() {
	return useMutation({
		mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
	});
}

export function useChangePasswordWithToken() {
	return useMutation({
		mutationFn: ({
			payload,
			accessToken,
		}: {
			payload: ChangePasswordPayload;
			accessToken?: string;
		}) => changePasswordWithToken(payload, accessToken),
	});
}

export function useMfaSetupStart() {
	return useMutation<MfaSetupStartResponse, unknown, void>({
		mutationFn: () => mfaSetupStart(),
	});
}

export function useMfaSetupVerify() {
	return useMutation<MfaSetupCompleteResponse, unknown, MfaSetupVerifyPayload>({
		mutationFn: (payload) => mfaSetupVerify(payload),
	});
}

export function usePermissions() {
	const { user } = useAuth();
	const { data: selfContext } = useSelfContext();

	const permissions = selfContext?.permissions ?? user?.permissions ?? [];
	const isSuperuser = user?.is_superuser;
	const roles =
		selfContext?.roles?.map((role) => role.name ?? role.id) ??
		user?.roles ??
		[];

	return {
		permissions,
		roles,
		can: (needed: string | string[]) =>
			Boolean(isSuperuser) || canPermissions(permissions, needed),
	};
}

export function loadRememberDeviceToken(orgId?: string | null) {
	if (!orgId || typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(REMEMBER_DEVICE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as RememberDeviceMap;
		return parsed?.[orgId] ?? null;
	} catch {
		return null;
	}
}

export function storeRememberDeviceToken(
	orgId: string,
	token: string | null | undefined,
) {
	if (typeof localStorage === "undefined") return;
	try {
		const raw = localStorage.getItem(REMEMBER_DEVICE_KEY);
		const parsed = raw ? (JSON.parse(raw) as RememberDeviceMap) : {};
		const next = { ...parsed };
		if (token) {
			next[orgId] = token;
		} else {
			delete next[orgId];
		}
		localStorage.setItem(REMEMBER_DEVICE_KEY, JSON.stringify(next));
	} catch {
		// ignore storage errors
	}
}

export function normalize(value: string, length: number) {
	return value.replace(/\D/g, "").slice(0, length);
}
