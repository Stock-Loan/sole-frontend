import type { PropsWithChildren, ReactNode } from "react";

export type PermissionCode =
	// Core / org
	| "system.admin"
	| "org.dashboard.view"
	| "org.settings.view"
	| "org.settings.manage"
	| "audit_log.view"
	| "impersonation.perform"
	// Users / roles / departments / ACL
	| "user.view"
	| "user.manage"
	| "user.onboard"
	| "role.view"
	| "role.manage"
	| "department.view"
	| "department.manage"
	| "permission_catalog.view"
	| "acl.manage"
	// Announcements
	| "announcement.view"
	| "announcement.manage"
	// Stock program
	| "stock.view"
	| "stock.manage"
	| "stock.program.view"
	| "stock.program.manage"
	| "stock.grant.view"
	| "stock.grant.manage"
	| "stock.vesting.view"
	| "stock.eligibility.view"
	| "stock.dashboard.view"
	| "stock.self.view"
	// Loan origination
	| "loan.apply"
	| "loan.view_own"
	| "loan.cancel_own"
	| "loan.view_all"
	| "loan.manage"
	| "loan.dashboard.view"
	// Loan workflow / queues
	| "loan.queue.hr.view"
	| "loan.workflow.hr.manage"
	| "loan.queue.finance.view"
	| "loan.workflow.finance.manage"
	| "loan.queue.legal.view"
	| "loan.workflow.legal.manage"
	| "loan.workflow.post_issuance.manage"
	| "loan.workflow.83b.manage"
	// Loan documents
	| "loan.document.view"
	| "loan.document.manage_hr"
	| "loan.document.manage_finance"
	| "loan.document.manage_legal"
	| "loan.document.self_view"
	| "loan.document.self_upload_83b"
	// Loan servicing / schedules / payments / what-if / exports
	| "loan.schedule.view"
	| "loan.schedule.self.view"
	| "loan.payment.view"
	| "loan.payment.record"
	| "loan.payment.refund"
	| "loan.what_if.simulate"
	| "loan.what_if.self.simulate"
	| "loan.export.schedule"
	| "loan.export.what_if"
	| "loan.export.self"
	// Reporting / exports (org)
	| "report.stock.export"
	| "report.loan.export"
	| "report.audit.export"
	// Fallback
	| string;

export interface PermissionCatalog {
	category: string;
	codes: PermissionCode[];
}

export type PermissionRequirement = PermissionCode | PermissionCode[];
export type PermissionCheckMode = "all" | "any";

export interface PermissionCheckOptions {
	mode?: PermissionCheckMode;
}

export interface PermissionGateProps extends PropsWithChildren {
	permission?: PermissionCode | PermissionCode[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	redirect?: boolean;
}
