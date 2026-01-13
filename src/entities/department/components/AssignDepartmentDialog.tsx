import { useState } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { useDepartmentsList, useAssignUsersToDepartment } from "../hooks";
import { useToast } from "@/shared/ui/use-toast";
import type { AssignDepartmentDialogProps } from "@/entities/department/types";

export function AssignDepartmentDialog({
	open,
	onOpenChange,
	membershipIds,
	onSuccess,
}: AssignDepartmentDialogProps) {
	const [departmentId, setDepartmentId] = useState<string>("");
	const { data: departmentsData, isLoading: isLoadingDepartments } =
		useDepartmentsList({
			page_size: 100, // Fetch reasonably large list for dropdown
		});
	const assignMutation = useAssignUsersToDepartment({
		onSuccess: () => {
			onOpenChange(false);
			onSuccess?.();
		},
	});
	const { toast } = useToast();

	const handleAssign = () => {
		if (!departmentId) return;
		assignMutation.mutate(
			{ departmentId, membershipIds },
			{
				onSuccess: (data) => {
					const assignedCount = data.assigned.length;
					const skippedCount = data.skipped_inactive.length;
					let description = `Assigned ${assignedCount} user${
						assignedCount !== 1 ? "s" : ""
					}.`;
					if (skippedCount > 0) {
						description += ` Skipped ${skippedCount} inactive user${
							skippedCount !== 1 ? "s" : ""
						}.`;
					}
					toast({
						title: "Department assigned",
						description,
					});
				},
			}
		);
	};

	const departments = departmentsData?.items ?? [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Assign Department</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Assign {membershipIds.length} selected user
						{membershipIds.length !== 1 ? "s" : ""} to a department.
					</p>
					<div className="space-y-2">
						<Label>Department</Label>
						<Select
							value={departmentId}
							onValueChange={setDepartmentId}
							disabled={isLoadingDepartments}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a department" />
							</SelectTrigger>
							<SelectContent>
								{departments.map((dept) => (
									<SelectItem key={dept.id} value={dept.id}>
										{dept.name} ({dept.code})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleAssign}
						disabled={!departmentId || assignMutation.isPending}
					>
						{assignMutation.isPending ? "Assigning..." : "Assign"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
