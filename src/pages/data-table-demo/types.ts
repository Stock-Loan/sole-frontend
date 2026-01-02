export type DemoStatus = "Active" | "On Leave" | "Inactive";

export type DemoEmploymentType = "Full-time" | "Part-time" | "Contractor";

export interface DemoTableRow {
	id: string;
	employee: string;
	department: string;
	status: DemoStatus;
	employmentType: DemoEmploymentType;
	startDate: string;
	lastActivity: string;
	loanBalance: number;
	riskScore: number;
	manager?: string | null;
	notes?: string | null;
}
