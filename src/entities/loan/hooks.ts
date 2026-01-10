import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { meKeys } from "@/shared/api/queryKeys";
import {
	cancelMyLoanApplication,
	createMyLoanDraft,
	getMyLoanApplication,
	getMyLoanQuote,
	listMyLoanApplications,
	submitMyLoanApplication,
	updateMyLoanDraft,
} from "./api";
import type {
	LoanApplication,
	LoanApplicationDraftCreate,
	LoanApplicationDraftUpdate,
	LoanApplicationListParams,
	LoanApplicationListResponse,
	LoanQuoteInput,
	LoanQuoteResponse,
} from "./types";

export function useMyLoanQuote(
	input: LoanQuoteInput | null,
	options: Omit<
		UseQueryOptions<LoanQuoteResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: meKeys.loans.quote(input ?? undefined),
		queryFn: () => {
			if (!input) {
				return Promise.reject(new Error("Loan quote input is required."));
			}
			return getMyLoanQuote(input);
		},
		enabled: Boolean(input) && (options.enabled ?? true),
		...options,
	});
}

export function useMyLoanApplications(
	params: LoanApplicationListParams = {},
	options: Omit<
		UseQueryOptions<LoanApplicationListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: meKeys.loans.list(params),
		queryFn: () => listMyLoanApplications(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMyLoanApplication(
	id: string,
	options: Omit<UseQueryOptions<LoanApplication>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: meKeys.loans.detail(id),
		queryFn: () => getMyLoanApplication(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useCreateMyLoanDraft(
	options: Omit<
		UseMutationOptions<LoanApplication, unknown, LoanApplicationDraftCreate>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createMyLoanDraft,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onSuccess as any)?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onError as any)?.(error, variables, context);
		},
		...options,
	});
}

export function useUpdateMyLoanDraft(
	options: Omit<
		UseMutationOptions<
			LoanApplication,
			unknown,
			{ id: string; payload: LoanApplicationDraftUpdate }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateMyLoanDraft(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			queryClient.invalidateQueries({ queryKey: meKeys.loans.detail(variables.id) });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onSuccess as any)?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onError as any)?.(error, variables, context);
		},
		...options,
	});
}

export function useSubmitMyLoanApplication(
	options: Omit<
		UseMutationOptions<LoanApplication, unknown, string>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: submitMyLoanApplication,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			queryClient.invalidateQueries({ queryKey: meKeys.loans.detail(variables) });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onSuccess as any)?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onError as any)?.(error, variables, context);
		},
		...options,
	});
}

export function useCancelMyLoanApplication(
	options: Omit<
		UseMutationOptions<LoanApplication, unknown, string>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: cancelMyLoanApplication,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			queryClient.invalidateQueries({ queryKey: meKeys.loans.detail(variables) });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onSuccess as any)?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onError as any)?.(error, variables, context);
		},
		...options,
	});
}
