export const aclKeys = {
	assignments: () => ["acl", "assignments"] as const,
	assignment: (id: string) => ["acl", "assignment", id] as const,
};
