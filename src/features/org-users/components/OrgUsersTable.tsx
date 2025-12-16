import { Eye, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { statusTone } from "../constants";
import type { OrgUsersTableProps } from "../types";

function StatusBadge({ label, variant }: { label: string; variant: string }) {
	const normalized = (variant || "").toLowerCase();
	const safeLabel = label || variant || "—";
	const displayLabel = safeLabel
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/^\w/, (c) => c.toUpperCase());

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
				statusTone[normalized] ?? "border-border bg-muted/40 text-foreground"
			)}
		>
			{displayLabel}
		</span>
	);
}

export function OrgUsersTable({
	items,
	isLoading,
	isError,
	isFetching,
	canManage = true,
	onRefresh,
	onSelect,
	selectedIds,
	onToggleSelect,
	onToggleSelectAll,
}: OrgUsersTableProps) {
	const selectionEnabled = Boolean(canManage);
	const visibleIds = selectionEnabled
		? items.map((item) => item.membership.id)
		: [];
	const allSelected =
		selectionEnabled &&
		visibleIds.length > 0 &&
		visibleIds.every((id) => selectedIds.has(id));
	const someSelected =
		selectionEnabled &&
		visibleIds.some((id) => selectedIds.has(id)) &&
		!allSelected;
	const columnCount = 7 + (selectionEnabled ? 1 : 0);

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40">
						{selectionEnabled ? (
							<TableHead className="w-10">
								<Checkbox
									checked={allSelected}
									indeterminate={someSelected}
									onCheckedChange={(checked) =>
										onToggleSelectAll(Boolean(checked), visibleIds)
									}
									aria-label="Select all users on this page"
								/>
							</TableHead>
						) : null}
						<TableHead className="min-w-[180px]">Full name</TableHead>
						<TableHead>Employee ID</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Department</TableHead>
						<TableHead>Employment status</TableHead>
						<TableHead>Platform status</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={columnCount}>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading users…
								</div>
							</TableCell>
						</TableRow>
					) : isError ? (
						<TableRow>
							<TableCell colSpan={columnCount}>
								<div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
									<p>
										We couldn&rsquo;t load users right now. Please try again.
									</p>
									<Button variant="outline" size="sm" onClick={onRefresh}>
										<RefreshCw className="mr-2 h-4 w-4" />
										Retry
									</Button>
								</div>
							</TableCell>
						</TableRow>
					) : items && items.length > 0 ? (
						items.map((item) => {
							const name =
								item.user.full_name ||
								[item.user.first_name, item.user.last_name]
									.filter(Boolean)
									.join(" ")
									.trim() ||
								item.user.email;
							const employmentStatus = item.membership.employment_status || "";
							const platformStatus = item.membership.platform_status || "";
							const departmentName =
								item.membership.department_name ||
								item.membership.department ||
								item.membership.department_id ||
								"—";
							return (
								<TableRow key={item.user.id}>
									{selectionEnabled ? (
										<TableCell className="w-10">
											<Checkbox
												checked={selectedIds.has(item.membership.id)}
												onCheckedChange={(checked) =>
													onToggleSelect(item.membership.id, Boolean(checked))
												}
												aria-label={`Select ${name}`}
											/>
										</TableCell>
									) : null}
									<TableCell className="space-y-1 font-semibold text-foreground">
										<div>
											<Link
												to={routes.userDetail.replace(
													":membershipId",
													item.membership.id
												)}
												className="text-primary underline-offset-4 hover:underline"
											>
												{name}
											</Link>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{item.membership.employee_id || "—"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{item.user.email}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{departmentName}
									</TableCell>
									<TableCell>
										<StatusBadge
											label={employmentStatus}
											variant={employmentStatus}
										/>
									</TableCell>
									<TableCell>
										<StatusBadge
											label={platformStatus}
											variant={platformStatus}
										/>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onSelect(item.membership.id)}
										>
											<Eye className="h-4 w-4" aria-hidden="true" />
											<span className="sr-only">Quick view</span>
										</Button>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={columnCount}>
								<div className="flex items-center justify-between rounded-md border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
									<span>No users found for this organization.</span>
									{isFetching ? (
										<span className="flex items-center gap-1 text-xs">
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
											Updating…
										</span>
									) : null}
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
