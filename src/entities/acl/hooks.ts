import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aclKeys } from "@/entities/acl/keys";
import {
	createAclAssignment,
	deleteAclAssignment,
	listAclAssignments,
	updateAclAssignment,
} from "@/entities/acl/api";
import type {
	AclAssignment,
	AclAssignmentCreatePayload,
	AclAssignmentUpdatePayload,
	AclAssignmentsResponse,
} from "@/entities/acl/types";

export function useAclAssignments() {
	return useQuery<AclAssignmentsResponse>({
		queryKey: aclKeys.assignments(),
		queryFn: listAclAssignments,
	});
}

export function useCreateAclAssignment() {
	const queryClient = useQueryClient();
	return useMutation<AclAssignment, unknown, AclAssignmentCreatePayload>({
		mutationFn: (payload) => createAclAssignment(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: aclKeys.assignments() });
		},
	});
}

export function useUpdateAclAssignment() {
	const queryClient = useQueryClient();
	return useMutation<
		AclAssignment,
		unknown,
		{ assignmentId: string; payload: AclAssignmentUpdatePayload }
	>({
		mutationFn: ({ assignmentId, payload }) =>
			updateAclAssignment(assignmentId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: aclKeys.assignments() });
		},
	});
}

export function useDeleteAclAssignment() {
	const queryClient = useQueryClient();
	return useMutation<void, unknown, string>({
		mutationFn: (assignmentId) => deleteAclAssignment(assignmentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: aclKeys.assignments() });
		},
	});
}
