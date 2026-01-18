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
	> = {}
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
	> = {}
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
	> = {}
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
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload) => createOrgDocumentFolder(payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
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
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ folderId, payload }) =>
			updateOrgDocumentFolder(folderId, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
	});
}

export function useDeleteOrgDocumentFolder(
	options: Omit<
		UseMutationOptions<void, unknown, { folderId: string }>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ folderId }) => deleteOrgDocumentFolder(folderId),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
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
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload) => uploadOrgDocumentTemplate(payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: ["org", "documents", "templates"],
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
	});
}

export function useDeleteOrgDocumentTemplate(
	options: Omit<
		UseMutationOptions<void, unknown, { templateId: string }>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ templateId }) => deleteOrgDocumentTemplate(templateId),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: ["org", "documents", "templates"],
			});
			queryClient.invalidateQueries({
				queryKey: orgKeys.documents.folders.list(),
			});
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
	});
}

export function useDownloadOrgDocumentTemplate(
	options: Omit<UseMutationOptions<Blob, unknown, string>, "mutationFn"> = {}
) {
	return useMutation({
		mutationFn: (templateId) => downloadOrgDocumentTemplate(templateId),
		...options,
	});
}
