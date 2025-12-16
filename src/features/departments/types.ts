export interface Department {
	id: string;
	org_id: string;
	name: string;
	code: string;
	is_archived?: boolean;
	member_count?: number;
	created_at?: string;
	updated_at?: string;
}

export interface DepartmentInput {
	name: string;
	code: string;
	is_archived?: boolean;
}
export type DepartmentFormMode = "create" | "edit";

export interface DepartmentListResponse {
	items: Department[];
	total?: number;
	page?: number;
	page_size?: number;
}

export interface DepartmentAssignPayload {
	membership_ids: string[];
}

export interface DepartmentListParams {
	page?: number;
	page_size?: number;
	include_archived?: boolean;
}

export interface DepartmentFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: DepartmentFormMode;
	initialDepartment?: Department | null;
	onSubmit: (values: DepartmentInput, id?: string) => Promise<void> | void;
	isSubmitting?: boolean;
}

export interface DepartmentTableProps {
	departments: Department[];
	isLoading: boolean;
	isError: boolean;
	canManage: boolean;
	onRetry: () => void;
	onEdit?: (department: Department) => void;
	onArchive?: (department: Department) => void;
	onViewMembers?: (department: Department) => void;
}

export interface DepartmentAssignResponse {
	department: Department;
	assigned: string[];
	skipped_inactive: string[];
	not_found: string[];
}

export interface DepartmentMember {
	user: {
		id: string;
		email: string;
		first_name?: string | null;
		last_name?: string | null;
		full_name?: string | null;
	};
	membership: {
		id: string;
		employment_status?: string | null;
		platform_status?: string | null;
	};
}

export interface DepartmentMembersResponse {
	items: DepartmentMember[];
	total?: number;
	page?: number;
	page_size?: number;
}
