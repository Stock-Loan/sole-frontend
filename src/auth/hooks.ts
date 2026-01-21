import {
	useMutation,
	useQuery,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { canPermissions } from "@/app/permissions/can";
import { authKeys } from "@/auth/keys";
import { useTenant } from "@/features/tenancy/hooks";
import {
	changePassword,
	changePasswordWithToken,
	completeLogin,
	discoverOrg,
	getMe,
	getSelfContext,
	loginMfa,
	loginMfaSetupStart,
	loginMfaSetupVerify,
	mfaSetupStart,
	mfaSetupVerify,
	startLogin,
} from "@/auth/api";
import { useAuthContext } from "@/auth/context";
import type {
	AuthUser,
	ChangePasswordPayload,
	LoginCompletePayload,
	LoginMfaPayload,
	LoginMfaResponse,
	LoginMfaSetupStartPayload,
	LoginMfaSetupVerifyPayload,
	LoginStartPayload,
	LoginStartResponse,
	MfaSetupStartResponse,
	MfaSetupVerifyPayload,
	OrgDiscoveryPayload,
} from "@/auth/types";
import type { OrgSummary } from "@/entities/org/types";
import { REMEMBER_DEVICE_KEY } from "./pages/LoginPage";
import type { RememberDeviceMap } from "./types";

export function useAuth() {
	return useAuthContext();
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

export function useStartLogin() {
	return useMutation<
		LoginStartResponse,
		unknown,
		{ payload: LoginStartPayload; orgId?: string }
	>({
		mutationFn: ({ payload, orgId }) => startLogin(payload, orgId),
	});
}

export function useCompleteLogin() {
	return useMutation({
		mutationFn: ({
			payload,
			orgId,
		}: {
			payload: LoginCompletePayload;
			orgId?: string;
		}) => completeLogin(payload, orgId),
	});
}

export function useLoginMfa() {
	return useMutation<
		LoginMfaResponse,
		unknown,
		{ payload: LoginMfaPayload; orgId?: string }
	>({
		mutationFn: ({ payload, orgId }) => loginMfa(payload, orgId),
	});
}

export function useLoginMfaSetupStart() {
	return useMutation<
		MfaSetupStartResponse,
		unknown,
		{ payload: LoginMfaSetupStartPayload; orgId?: string }
	>({
		mutationFn: ({ payload, orgId }) => loginMfaSetupStart(payload, orgId),
	});
}

export function useLoginMfaSetupVerify() {
	return useMutation<
		LoginMfaResponse,
		unknown,
		{ payload: LoginMfaSetupVerifyPayload; orgId?: string }
	>({
		mutationFn: ({ payload, orgId }) => loginMfaSetupVerify(payload, orgId),
	});
}

export function useOrgDiscovery() {
	return useMutation<OrgSummary[], unknown, OrgDiscoveryPayload>({
		mutationFn: (payload) => discoverOrg(payload),
	});
}

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
	return useMutation<LoginMfaResponse, unknown, MfaSetupVerifyPayload>({
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
