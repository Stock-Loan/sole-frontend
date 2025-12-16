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
import { ROLE_TYPE_LABELS, ROLE_TYPE_STYLES } from "../constants";
import type { RolesTableProps } from "../types";

export function RolesTable({
	roles,
	isLoading,
	isError,
	onRetry,
	onViewPermissions,
	onEdit,
}: RolesTableProps) {
	if (isLoading) {
		return <LoadingState label="Loading roles..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load roles"
				message="We couldn't fetch roles for this organization."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (!roles.length) {
		return (
			<EmptyState
				title="No roles yet"
				message="Create or import roles to manage permissions in this organization."
			/>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/30">
						<TableHead>Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Type</TableHead>
						<TableHead className="text-center">Permissions</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{roles.map((role) => {
						const typeKey = role.is_system_role ? "system" : "custom";
						const permissionCount = role.permissions?.length ?? 0;
						return (
							<TableRow key={role.id}>
								<TableCell className="font-semibold">{role.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{role.description || "—"}
								</TableCell>
								<TableCell className="whitespace-nowrap">
									<span
										className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${ROLE_TYPE_STYLES[typeKey]}`}
									>
										{ROLE_TYPE_LABELS[typeKey]}
									</span>
								</TableCell>
								<TableCell className="text-center">
									<span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold">
										{permissionCount}
									</span>
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2 whitespace-nowrap">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onViewPermissions(role)}
										>
											View permissions
										</Button>
										{onEdit ? (
											<Button
												variant="secondary"
												size="sm"
												disabled={Boolean(role.is_system_role)}
												onClick={() => onEdit(role)}
											>
												Edit
											</Button>
										) : null}
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
