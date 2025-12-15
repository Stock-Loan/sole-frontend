import type { PermissionCode, PermissionCatalog } from "./types";

export const ALL_PERMISSION_CODES: PermissionCode[] = [
	// Core / org
	"system.admin",
	"org.dashboard.view",
	"org.settings.view",
	"org.settings.manage",
	"audit_log.view",
	"impersonation.perform",
	// Users / roles / departments / ACL
	"user.view",
	"user.manage",
	"user.onboard",
	"role.view",
	"role.manage",
	"department.view",
	"department.manage",
	"permission_catalog.view",
	"acl.manage",
	// Announcements
	"announcement.view",
	"announcement.manage",
	// Stock program
	"stock.program.view",
	"stock.program.manage",
	"stock.grant.view",
	"stock.grant.manage",
	"stock.vesting.view",
	"stock.eligibility.view",
	"stock.dashboard.view",
	"stock.self.view",
	// Loan origination
	"loan.apply",
	"loan.view_own",
	"loan.cancel_own",
	"loan.view_all",
	"loan.manage",
	"loan.dashboard.view",
	// Loan workflow / queues
	"loan.queue.hr.view",
	"loan.workflow.hr.manage",
	"loan.queue.finance.view",
	"loan.workflow.finance.manage",
	"loan.queue.legal.view",
	"loan.workflow.legal.manage",
	"loan.workflow.post_issuance.manage",
	"loan.workflow.83b.manage",
	// Loan documents
	"loan.document.view",
	"loan.document.manage_hr",
	"loan.document.manage_finance",
	"loan.document.manage_legal",
	"loan.document.self_view",
	"loan.document.self_upload_83b",
	// Loan servicing / schedules / payments / what-if / exports
	"loan.schedule.view",
	"loan.schedule.self.view",
	"loan.payment.view",
	"loan.payment.record",
	"loan.payment.refund",
	"loan.what_if.simulate",
	"loan.what_if.self.simulate",
	"loan.export.schedule",
	"loan.export.what_if",
	"loan.export.self",
	// Reporting / exports (org)
	"report.stock.export",
	"report.loan.export",
	"report.audit.export",
];

export const ROLE_TYPE_LABELS = {
	system: "System role",
	custom: "Custom role",
} as const;

export const ROLE_TYPE_STYLES = {
	system: "bg-amber-100 text-amber-800 border-amber-200",
	custom: "bg-emerald-100 text-emerald-800 border-emerald-200",
} as const;

// Optional grouping scaffold for future pickers; adjust as UI needs evolve.
export const PERMISSION_CATALOG: PermissionCatalog[] = [
	{
		category: "Core",
		codes: [
			"system.admin",
			"org.dashboard.view",
			"org.settings.view",
			"org.settings.manage",
			"audit_log.view",
			"impersonation.perform",
		],
	},
	{
		category: "Users & Roles",
		codes: [
			"user.view",
			"user.manage",
			"user.onboard",
			"role.view",
			"role.manage",
			"department.view",
			"department.manage",
			"permission_catalog.view",
			"acl.manage",
		],
	},
	{
		category: "Announcements",
		codes: ["announcement.view", "announcement.manage"],
	},
	{
		category: "Stock",
		codes: [
			"stock.program.view",
			"stock.program.manage",
			"stock.grant.view",
			"stock.grant.manage",
			"stock.vesting.view",
			"stock.eligibility.view",
			"stock.dashboard.view",
			"stock.self.view",
		],
	},
	{
		category: "Loans",
		codes: [
			"loan.apply",
			"loan.view_own",
			"loan.cancel_own",
			"loan.view_all",
			"loan.manage",
			"loan.dashboard.view",
			"loan.queue.hr.view",
			"loan.workflow.hr.manage",
			"loan.queue.finance.view",
			"loan.workflow.finance.manage",
			"loan.queue.legal.view",
			"loan.workflow.legal.manage",
			"loan.workflow.post_issuance.manage",
			"loan.workflow.83b.manage",
			"loan.document.view",
			"loan.document.manage_hr",
			"loan.document.manage_finance",
			"loan.document.manage_legal",
			"loan.document.self_view",
			"loan.document.self_upload_83b",
			"loan.schedule.view",
			"loan.schedule.self.view",
			"loan.payment.view",
			"loan.payment.record",
			"loan.payment.refund",
			"loan.what_if.simulate",
			"loan.what_if.self.simulate",
			"loan.export.schedule",
			"loan.export.what_if",
			"loan.export.self",
		],
	},
	{
		category: "Reporting",
		codes: ["report.stock.export", "report.loan.export", "report.audit.export"],
	},
];
