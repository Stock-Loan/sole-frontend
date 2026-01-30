import type { OrgUserListItem } from "@/entities/user/types";
import type { AclAssignment } from "@/entities/acl/types";
import type { AuditLog } from "@/entities/audit/types";

export interface AclAssignmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	assignment?: AclAssignment | null;
	onSuccess?: () => void;
}

export interface AclAssignmentDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assignment: AclAssignment | null;
	onConfirm: (assignment: AclAssignment) => void;
	isLoading?: boolean;
}

export interface AclUserPickerProps {
	value: OrgUserListItem | null;
	onChange: (user: OrgUserListItem | null) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export interface AclUserPermissionsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assignment: AclAssignment | null;
	assignments: AclAssignment[];
}
export interface AuditLogDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	auditLog: AuditLog | null;
}
