import { formatDate } from "@/shared/lib/format";
import type { AclAssignment } from "@/entities/acl/types";

export function isAclExpired(expiresAt?: string | null) {
	if (!expiresAt) return false;
	const parsed = new Date(expiresAt);
	if (Number.isNaN(parsed.getTime())) return false;
	return parsed.getTime() < Date.now();
}

export function formatAclExpiresAt(expiresAt?: string | null) {
	if (!expiresAt) return "Never";
	return formatDate(expiresAt);
}

export function toDateTimeLocalValue(value?: string | null) {
	if (!value) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	return parsed.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value?: string | null) {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toISOString();
}

export function getAssignmentUserLabel(assignment: AclAssignment) {
	return (
		assignment.full_name?.trim() ||
		assignment.email?.trim() ||
		assignment.user_id
	);
}
