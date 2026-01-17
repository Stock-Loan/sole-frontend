import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { meKeys, orgKeys } from "@/shared/api/queryKeys";
import {
	cancelMyLoanApplication,
	createMyLoanDraft,
	getFinanceLoanDetail,
	getHrLoanDetail,
	getLegalLoanDetail,
	getMyLoanApplication,
	getHrLoanQueue,
	getFinanceLoanQueue,
	getLegalLoanQueue,
	getMyHrLoanQueue,
	getMyFinanceLoanQueue,
	getMyLegalLoanQueue,
	getOrgLoanApplication,
	getMyLoanQuote,
	listOrgLoanDocuments,
	listOrgLoanApplications,
	listMyLoanApplications,
	listMyLoanDocuments,
	assignLoanWorkflowStage,
	registerMyLoan83bDocument,
	registerFinanceDocument,
	registerHrDocument,
	registerLegalDocument,
	registerLegalIssuanceDocument,
	submitMyLoanApplication,
	updateFinanceStage,
	updateHrStage,
	updateLegalStage,
	updateMyLoanDraft,
} from "./api";
import type {
	FinanceLoanDetailResponse,
	HrLoanDetailResponse,
	LegalLoanDetailResponse,
	LoanApplication,
	LoanApplicationDraftCreate,
	LoanApplicationDraftUpdate,
	LoanApplicationListParams,
	LoanApplicationListResponse,
	LoanDocument,
	LoanDocumentCreatePayload,
	LoanDocumentsGroupedResponse,
	LoanWorkflowAssignPayload,
	LoanQueueListParams,
	LoanQueueListResponse,
	LoanQuoteInput,
	LoanQuoteResponse,
	LoanWorkflowStage,
	LoanWorkflowStageType,
	LoanWorkflowStageUpdatePayload,
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

export function useMyLoanDocuments(
	id: string,
	options: Omit<
		UseQueryOptions<LoanDocumentsGroupedResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: meKeys.loans.documents(id),
		queryFn: () => listMyLoanDocuments(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useOrgLoanApplications(
	params: LoanApplicationListParams = {},
	options: Omit<
		UseQueryOptions<LoanApplicationListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.list(params),
		queryFn: () => listOrgLoanApplications(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useOrgLoanApplication(
	id: string,
	options: Omit<UseQueryOptions<LoanApplication>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.detail(id),
		queryFn: () => getOrgLoanApplication(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useHrLoanQueue(
	params: LoanQueueListParams = {},
	options: Omit<
		UseQueryOptions<LoanQueueListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.queue.hr(params),
		queryFn: () => getHrLoanQueue(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useFinanceLoanQueue(
	params: LoanQueueListParams = {},
	options: Omit<
		UseQueryOptions<LoanQueueListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.queue.finance(params),
		queryFn: () => getFinanceLoanQueue(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useLegalLoanQueue(
	params: LoanQueueListParams = {},
	options: Omit<
		UseQueryOptions<LoanQueueListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.queue.legal(params),
		queryFn: () => getLegalLoanQueue(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMyHrLoanQueue(
	params: LoanQueueListParams = {},
	options: Omit<
		UseQueryOptions<LoanQueueListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.queue.me.hr(params),
		queryFn: () => getMyHrLoanQueue(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMyFinanceLoanQueue(
	params: LoanQueueListParams = {},
	options: Omit<
		UseQueryOptions<LoanQueueListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.queue.me.finance(params),
		queryFn: () => getMyFinanceLoanQueue(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMyLegalLoanQueue(
	params: LoanQueueListParams = {},
	options: Omit<
		UseQueryOptions<LoanQueueListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.queue.me.legal(params),
		queryFn: () => getMyLegalLoanQueue(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useHrLoanDetail(
	id: string,
	options: Omit<UseQueryOptions<HrLoanDetailResponse>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.workflowDetail.hr(id),
		queryFn: () => getHrLoanDetail(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useFinanceLoanDetail(
	id: string,
	options: Omit<
		UseQueryOptions<FinanceLoanDetailResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.workflowDetail.finance(id),
		queryFn: () => getFinanceLoanDetail(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useLegalLoanDetail(
	id: string,
	options: Omit<
		UseQueryOptions<LegalLoanDetailResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.workflowDetail.legal(id),
		queryFn: () => getLegalLoanDetail(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useOrgLoanDocuments(
	id: string,
	options: Omit<
		UseQueryOptions<LoanDocumentsGroupedResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.loans.documents.org(id),
		queryFn: () => listOrgLoanDocuments(id),
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

export function useUpdateHrStage(
	options: Omit<
		UseMutationOptions<
			LoanWorkflowStage,
			unknown,
			{ id: string; payload: LoanWorkflowStageUpdatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateHrStage(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
			queryClient.invalidateQueries({ queryKey: ["org", "loans", "queue", "hr"] });
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

export function useUpdateFinanceStage(
	options: Omit<
		UseMutationOptions<
			LoanWorkflowStage,
			unknown,
			{ id: string; payload: LoanWorkflowStageUpdatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateFinanceStage(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: ["org", "loans", "queue", "finance"],
			});
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

export function useUpdateLegalStage(
	options: Omit<
		UseMutationOptions<
			LoanWorkflowStage,
			unknown,
			{ id: string; payload: LoanWorkflowStageUpdatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateLegalStage(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: ["org", "loans", "queue", "legal"],
			});
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

export function useRegisterHrDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentCreatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerHrDocument(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
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

export function useRegisterFinanceDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentCreatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerFinanceDocument(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
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

export function useRegisterLegalDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentCreatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerLegalDocument(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
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

export function useRegisterLegalIssuanceDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentCreatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerLegalIssuanceDocument(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
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

export function useRegisterMyLoan83bDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentCreatePayload }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerMyLoan83bDocument(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: meKeys.loans.documents(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: meKeys.loans.detail(variables.id),
			});
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

export function useAssignLoanWorkflowStage(
	options: Omit<
		UseMutationOptions<
			LoanWorkflowStage,
			unknown,
			{
				id: string;
				stageType: LoanWorkflowStageType;
				payload?: LoanWorkflowAssignPayload;
			}
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, stageType, payload }) =>
			assignLoanWorkflowStage(id, stageType, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["org", "loans", "queue"] });
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
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
