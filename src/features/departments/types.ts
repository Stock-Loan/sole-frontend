export interface Department {
	id: string;
	orgId: string;
	name: string;
	description?: string | null;
	isActive?: boolean;
}
