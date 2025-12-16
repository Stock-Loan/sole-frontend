import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AssignDepartmentCardProps, DepartmentOption } from "../types";

export function AssignDepartmentCard({
	departments,
	selectedDepartmentId,
	onDepartmentChange,
	onApply,
	isPending,
	disabled,
}: AssignDepartmentCardProps) {
	return (
		<div className="flex w-full flex-col gap-2 rounded-lg border border-border/70 bg-card/50 px-3 py-3 text-sm shadow-sm lg:max-w-md">
			<div className="flex flex-wrap items-center gap-2">
				<p className="text-sm font-semibold text-foreground">
					Assign Department
				</p>
				<span className="text-xs text-muted-foreground">
					Select users to assign to department.
				</span>
			</div>
			<div className="flex flex-wrap items-end gap-2">
				<Select
					value={selectedDepartmentId}
					onValueChange={onDepartmentChange}
					disabled={isPending || disabled}
				>
					<SelectTrigger className="h-9 min-w-[200px] flex-1">
						<SelectValue placeholder="Choose department" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">No department</SelectItem>
						{departments.map((dept: DepartmentOption) => (
							<SelectItem key={dept.id} value={dept.id}>
								{dept.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="w-[30%]">
					<Button
						size="sm"
						className="w-full"
						disabled={
							(!selectedDepartmentId && selectedDepartmentId !== "none") ||
							isPending ||
							disabled
						}
						onClick={onApply}
					>
						{isPending ? "Assigning..." : "Apply"}
					</Button>
				</div>
			</div>
		</div>
	);
}
