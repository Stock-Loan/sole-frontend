import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { orgKeys } from "@/shared/api/queryKeys";
import type {
	OrgDocumentFolder,
	OrgDocumentFolderCreatePayload,
	OrgDocumentFolderListResponse,
	OrgDocumentFolderUpdatePayload,
	OrgDocumentTemplate,
	OrgDocumentTemplateListParams,
	OrgDocumentTemplateListResponse,
	OrgDocumentTemplateUploadPayload,
} from "@/entities/document/types";
import {
	createOrgDocumentFolder,
	deleteOrgDocumentFolder,
	deleteOrgDocumentTemplate,
	downloadOrgDocumentTemplate,
	getOrgDocumentTemplate,
	listOrgDocumentFolders,
	listOrgDocumentTemplates,
	updateOrgDocumentFolder,
	uploadOrgDocumentTemplate,
} from "./api";

export function useOrgDocumentFolders(
	enabled = true,
	options: Omit<
		UseQueryOptions<OrgDocumentFolderListResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.documents.folders.list(),
		queryFn: () => listOrgDocumentFolders(),
		enabled,
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useOrgDocumentTemplates(
	params: OrgDocumentTemplateListParams = {},
	options: Omit<
		UseQueryOptions<OrgDocumentTemplateListResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.documents.templates.list(params),
		queryFn: () => listOrgDocumentTemplates(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useOrgDocumentTemplate(
	id: string,
	options: Omit<
		UseQueryOptions<OrgDocumentTemplate>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgKeys.documents.templates.detail(id),
		queryFn: () => getOrgDocumentTemplate(id),
		enabled: Boolean(id) && (options.enabled ?? true),
		...options,
	});
}

export function useCreateOrgDocumentFolder(
	options: Omit<
		UseMutationOptions<
			OrgDocumentFolder,
			unknown,
			OrgDocumentFolderCreatePayload
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation<
		OrgDocumentFolder,
		unknown,
		OrgDocumentFolderCreatePayload
	>({
		mutationFn: (payload) => createOrgDocumentFolder(payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function useUpdateOrgDocumentFolder(
	options: Omit<
		UseMutationOptions<
			OrgDocumentFolder,
			unknown,
			{ folderId: string; payload: OrgDocumentFolderUpdatePayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation<
		OrgDocumentFolder,
		unknown,
		{ folderId: string; payload: OrgDocumentFolderUpdatePayload }
	>({
		mutationFn: ({ folderId, payload }) =>
			updateOrgDocumentFolder(folderId, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function useDeleteOrgDocumentFolder(
	options: Omit<
		UseMutationOptions<void, unknown, { folderId: string }>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation<void, unknown, { folderId: string }>({
		mutationFn: ({ folderId }) => deleteOrgDocumentFolder(folderId),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function useUploadOrgDocumentTemplate(
	options: Omit<
		UseMutationOptions<
			OrgDocumentTemplate,
			unknown,
			OrgDocumentTemplateUploadPayload
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation<
		OrgDocumentTemplate,
		unknown,
		OrgDocumentTemplateUploadPayload
	>({
		mutationFn: (payload) => uploadOrgDocumentTemplate(payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: ["org", "documents", "templates"],
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function useDeleteOrgDocumentTemplate(
	options: Omit<
		UseMutationOptions<void, unknown, { templateId: string }>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation<void, unknown, { templateId: string }>({
		mutationFn: ({ templateId }) => deleteOrgDocumentTemplate(templateId),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: ["org", "documents", "templates"],
			});
			void queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function useDownloadOrgDocumentTemplate(
	options: Omit<UseMutationOptions<Blob, unknown, string>, "mutationFn"> = {},
) {
	return useMutation({
		mutationFn: (templateId) => downloadOrgDocumentTemplate(templateId),
		...options,
	});
}
