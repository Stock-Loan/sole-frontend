export interface AuditLogEntry {
	id: string;
	orgId: string;
	action: string;
	actorId: string;
	resource: string;
	createdAt: string;
	metadata?: Record<string, unknown>;
}
