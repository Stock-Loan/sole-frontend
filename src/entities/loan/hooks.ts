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
	listMyLoanRepayments,
	getMyLoanSchedule,
	exportMyLoanCsv,
	getHrLoanQueue,
	getFinanceLoanQueue,
	getLegalLoanQueue,
	getMyHrLoanQueue,
	getMyFinanceLoanQueue,
	getMyLegalLoanQueue,
	getLoanDashboardSummary,
	getOrgLoanApplication,
	editOrgLoanApplication,
	getMyLoanQuote,
	listOrgLoanDocuments,
	listOrgLoanApplications,
	listOrgLoanRepayments,
	createOrgLoanRepayment,
	getOrgLoanSchedule,
	runOrgLoanScheduleWhatIf,
	runMyLoanScheduleWhatIf,
	exportOrgLoanSchedule,
	listMyLoanApplications,
	listMyLoanDocuments,
	downloadMyLoanDocument,
	downloadOrgLoanDocument,
	activateLoanBacklog,
	assignLoanWorkflowStage,
	registerMyLoan83bDocument,
	uploadMyLoan83bDocument,
	registerFinanceDocument,
	registerHrDocument,
	registerLegalDocument,
	registerLegalIssuanceDocument,
	uploadFinanceDocument,
	uploadHrDocument,
	uploadLegalDocument,
	uploadLegalIssuanceDocument,
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
	LoanDashboardSummary,
	LoanDashboardSummaryParams,
	LoanDocument,
	LoanDocumentCreatePayload,
	LoanDocumentUploadPayload,
	LoanDocumentsGroupedResponse,
	LoanActivateBacklogResponse,
	LoanRepaymentCreatePayload,
	LoanRepaymentRecordResponse,
	LoanRepaymentsResponse,
	LoanScheduleResponse,
	LoanScheduleWhatIfPayload,
	LoanAdminEditPayload,
	LoanWorkflowAssignPayload,
	LoanQueueListParams,
	LoanQueueListResponse,
	LoanQuoteInput,
	LoanQuoteResponse,
	LoanWorkflowStage,
	LoanWorkflowStageType,
	LoanWorkflowStageUpdatePayload,
} from "./types";
import type { OrgUserListItem } from "../user/types";

export function useMyLoanQuote(
	input: LoanQuoteInput | null,
	options: Omit<
		UseQueryOptions<LoanQuoteResponse>,
		"queryKey" | "queryFn"
	> = {},
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
	> = {},
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
	options: Omit<UseQueryOptions<LoanApplication>, "queryKey" | "queryFn"> = {},
) {
	return useQuery({
		queryKey: meKeys.loans.detail(id),
		queryFn: () => getMyLoanApplication(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useMyLoanRepayments(
	id: string,
	options: Omit<
		UseQueryOptions<LoanRepaymentsResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: meKeys.loans.repayments(id),
		queryFn: () => listMyLoanRepayments(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMyLoanSchedule(
	id: string,
	options: Omit<
		UseQueryOptions<LoanScheduleResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: meKeys.loans.schedule(id),
		queryFn: () => getMyLoanSchedule(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMyLoanScheduleWhatIf(
	id: string,
	options: Omit<
		UseMutationOptions<
			LoanScheduleResponse,
			unknown,
			LoanScheduleWhatIfPayload
		>,
		"mutationFn"
	> = {},
) {
	return useMutation({
		mutationFn: (payload) => runMyLoanScheduleWhatIf(id, payload),
		...options,
	});
}

export function useMyLoanDocuments(
	id: string,
	options: Omit<
		UseQueryOptions<LoanDocumentsGroupedResponse>,
		"queryKey" | "queryFn"
	> = {},
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
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.loans.list(params),
		queryFn: () => listOrgLoanApplications(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useOrgLoanRepayments(
	id: string,
	options: Omit<
		UseQueryOptions<LoanRepaymentsResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.loans.repayments(id),
		queryFn: () => listOrgLoanRepayments(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useCreateOrgLoanRepayment(
	id: string,
	options: Omit<
		UseMutationOptions<
			LoanRepaymentRecordResponse,
			unknown,
			LoanRepaymentCreatePayload
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload) => createOrgLoanRepayment(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.repayments(id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.detail(id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.schedule(id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useOrgLoanSchedule(
	id: string,
	options: Omit<
		UseQueryOptions<LoanScheduleResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.loans.schedule(id),
		queryFn: () => getOrgLoanSchedule(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useOrgLoanScheduleWhatIf(
	id: string,
	options: Omit<
		UseMutationOptions<
			LoanScheduleResponse,
			unknown,
			LoanScheduleWhatIfPayload
		>,
		"mutationFn"
	> = {},
) {
	return useMutation({
		mutationFn: (payload) => runOrgLoanScheduleWhatIf(id, payload),
		...options,
	});
}

export function useLoanDashboardSummary(
	params: LoanDashboardSummaryParams = {},
	options: Omit<
		UseQueryOptions<LoanDashboardSummary>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.loans.summary(params),
		queryFn: () => getLoanDashboardSummary(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useExportMyLoanCsv(
	options: UseMutationOptions<Blob, unknown, string> = {},
) {
	return useMutation({
		mutationFn: (id: string) => exportMyLoanCsv(id),
		...options,
	});
}

export function useExportOrgLoanSchedule(
	options: UseMutationOptions<Blob, unknown, string> = {},
) {
	return useMutation({
		mutationFn: (id: string) => exportOrgLoanSchedule(id),
		...options,
	});
}

export function useOrgLoanApplication(
	id: string,
	options: Omit<UseQueryOptions<LoanApplication>, "queryKey" | "queryFn"> = {},
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
	> = {},
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
	> = {},
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
	> = {},
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
	> = {},
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
	> = {},
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
	> = {},
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
	options: Omit<
		UseQueryOptions<HrLoanDetailResponse>,
		"queryKey" | "queryFn"
	> = {},
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
	> = {},
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
	> = {},
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
	> = {},
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createMyLoanDraft,
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateMyLoanDraft(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.detail(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useSubmitMyLoanApplication(
	options: Omit<
		UseMutationOptions<LoanApplication, unknown, string>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: submitMyLoanApplication,
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.detail(variables),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useCancelMyLoanApplication(
	options: Omit<
		UseMutationOptions<LoanApplication, unknown, string>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: cancelMyLoanApplication,
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({ queryKey: meKeys.loans.list() });
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.detail(variables),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateHrStage(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: ["org", "loans", "queue", "hr"],
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateFinanceStage(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: ["org", "loans", "queue", "finance"],
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => updateLegalStage(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: ["org", "loans", "queue", "legal"],
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerHrDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUploadHrDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentUploadPayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => uploadHrDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerFinanceDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUploadFinanceDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentUploadPayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => uploadFinanceDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerLegalDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUploadLegalDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentUploadPayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => uploadLegalDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerLegalIssuanceDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUploadLegalIssuanceDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentUploadPayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => uploadLegalIssuanceDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => registerMyLoan83bDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.documents(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.detail(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUploadMyLoan83bDocument(
	options: Omit<
		UseMutationOptions<
			LoanDocument,
			unknown,
			{ id: string; payload: LoanDocumentUploadPayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation<
		LoanDocument,
		unknown,
		{ id: string; payload: LoanDocumentUploadPayload }
	>({
		mutationFn: ({ id, payload }) => uploadMyLoan83bDocument(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.documents(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: meKeys.loans.detail(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function useDownloadOrgLoanDocument(
	options: Omit<UseMutationOptions<Blob, unknown, string>, "mutationFn"> = {},
) {
	return useMutation({
		mutationFn: (documentId) => downloadOrgLoanDocument(documentId),
		...options,
	});
}

export function useDownloadMyLoanDocument(
	options: Omit<UseMutationOptions<Blob, unknown, string>, "mutationFn"> = {},
) {
	return useMutation({
		mutationFn: (documentId) => downloadMyLoanDocument(documentId),
		...options,
	});
}

export function useActivateLoanBacklog(
	options: Omit<
		UseMutationOptions<
			LoanActivateBacklogResponse,
			unknown,
			{ limit?: number; offset?: number }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params) => activateLoanBacklog(params),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({ queryKey: orgKeys.loans.list() });
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useEditOrgLoanApplication(
	options: Omit<
		UseMutationOptions<
			LoanApplication,
			unknown,
			{ id: string; payload: LoanAdminEditPayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => editOrgLoanApplication(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.detail(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.list(),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, stageType, payload }) =>
			assignLoanWorkflowStage(id, stageType, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: ["org", "loans", "queue"],
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.hr(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.finance(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.workflowDetail.legal(variables.id),
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.loans.documents.org(variables.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}
export function getManagePermission(stageType?: LoanWorkflowStageType | null) {
	if (!stageType) return null;
	if (stageType === "HR_REVIEW") return "loan.workflow.hr.manage";
	if (stageType === "FINANCE_PROCESSING") return "loan.workflow.finance.manage";
	if (stageType === "LEGAL_EXECUTION") return "loan.workflow.legal.manage";
	return null;
}
export function getRoleNameForStage(stageType?: LoanWorkflowStageType | null) {
	if (stageType === "HR_REVIEW") return "HR";
	if (stageType === "FINANCE_PROCESSING") return "FINANCE";
	if (stageType === "LEGAL_EXECUTION") return "LEGAL";
	return null;
}
export function getUserDisplayName(user: OrgUserListItem["user"]) {
	return (
		user.full_name ||
		[user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
		user.email
	);
}
