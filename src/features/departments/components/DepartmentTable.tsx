import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { DepartmentTableProps } from "../types";

export function DepartmentTable({
	departments,
	isLoading,
	isError,
	onRetry,
	onEdit,
	onArchive,
	canManage,
	onViewMembers,
}: DepartmentTableProps) {
	if (isLoading) {
		return <LoadingState label="Loading departments..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load departments"
				message="Please try again."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (!departments.length) {
		return (
			<EmptyState
				title="No departments yet"
				message="Create a department to organize your org."
			/>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/30">
						<TableHead>Name</TableHead>
						<TableHead>Code</TableHead>
						<TableHead className="text-center">Members</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{departments.map((dept) => (
						<TableRow key={dept.id}>
							<TableCell className="font-semibold">{dept.name}</TableCell>
							<TableCell className="text-muted-foreground">{dept.code}</TableCell>
							<TableCell className="text-center text-muted-foreground">
								{typeof dept.member_count === "number"
									? dept.member_count
									: "—"}
							</TableCell>
							<TableCell>
								<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold">
									{dept.is_archived ? "Archived" : "Active"}
								</span>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{formatDate(dept.created_at)}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => onViewMembers?.(dept)}
									>
										View members
									</Button>
									{canManage ? (
										<>
											<Button
												size="sm"
												variant="outline"
												onClick={() => onEdit?.(dept)}
											>
												Edit
											</Button>
											<Button
												size="sm"
												variant="destructive"
												disabled={dept.is_archived}
												onClick={() => onArchive?.(dept)}
											>
												Archive
											</Button>
										</>
									) : null}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
