import { useMutation, useQuery } from "@tanstack/react-query";
import { canPermissions } from "@/app/permissions/can";
import { authKeys } from "@/auth/keys";
import { useTenant } from "@/features/tenancy/hooks";
import {
	changePassword,
	changePasswordWithToken,
	completeLogin,
	getMe,
	getSelfContext,
	startLogin,
} from "@/auth/api";
import { useAuthContext } from "@/auth/context";
import type {
	ChangePasswordPayload,
	LoginCompletePayload,
	LoginStartPayload,
	LoginStartResponse,
} from "@/auth/types";

export function useAuth() {
	return useAuthContext();
}

export function useSelfContext() {
	const { tokens } = useAuth();
	const { currentOrgId } = useTenant();

	const query = useQuery({
		queryKey: authKeys.selfContext(currentOrgId),
		queryFn: getSelfContext,
		enabled: Boolean(tokens?.access_token),
		staleTime: 5 * 60 * 1000,
	});

	return query;
}

export function useMe() {
	const { tokens } = useAuth();

	return useQuery({
		queryKey: authKeys.me(),
		queryFn: getMe,
		enabled: Boolean(tokens?.access_token),
		staleTime: 5 * 60 * 1000,
	});
}

export function useStartLogin() {
	return useMutation<LoginStartResponse, unknown, LoginStartPayload>({
		mutationFn: (payload) => startLogin(payload),
	});
}

export function useCompleteLogin() {
	return useMutation({
		mutationFn: (payload: LoginCompletePayload) => completeLogin(payload),
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

export function usePermissions() {
	const { user } = useAuth();
	const { data: selfContext } = useSelfContext();

	const permissions = selfContext?.permissions ?? user?.permissions ?? [];
	const isSuperuser = user?.is_superuser;
	const roles =
		selfContext?.roles?.map((role) => role.name ?? role.id) ?? user?.roles ?? [];

	return {
	permissions,
		roles,
		can: (needed: string | string[]) =>
			Boolean(isSuperuser) || canPermissions(permissions, needed),
	};
}
