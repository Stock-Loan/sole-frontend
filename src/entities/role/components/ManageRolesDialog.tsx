import { useState, useMemo } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/checkbox";
import { useRolesList, useUpdateUserRoles } from "../hooks";
import { useToast } from "@/shared/ui/use-toast";
import { normalizeDisplay } from "@/shared/lib/utils";
import type { ManageRolesDialogProps } from "@/entities/role/types";

export function ManageRolesDialog({
	open,
	onOpenChange,
	user,
	onSuccess,
}: ManageRolesDialogProps) {
	const { data: rolesData, isLoading } = useRolesList({ page_size: 100 });
	const updateMutation = useUpdateUserRoles({
		onSuccess: () => {
			toast({ title: "Roles updated" });
			onOpenChange(false);
			onSuccess?.();
		},
	});
	const { toast } = useToast();

	const initialRoleIds = useMemo(() => {
		if (!user?.roles) return new Set<string>();
		return new Set(user.roles.map((r) => r.id));
	}, [user]);

	const [selectedRoleIds, setSelectedRoleIds] =
		useState<Set<string>>(initialRoleIds);

	const handleSave = () => {
		if (!user) return;
		
		const currentIds = initialRoleIds;
		const nextIds = selectedRoleIds;

		const addRoleIds = Array.from(nextIds).filter((id) => !currentIds.has(id));
		const removeRoleIds = Array.from(currentIds).filter((id) => !nextIds.has(id));

		if (addRoleIds.length === 0 && removeRoleIds.length === 0) {
			onOpenChange(false);
			return;
		}

		updateMutation.mutate({
			membershipId: user.membership.id,
			addRoleIds,
			removeRoleIds,
		});
	};

	const toggleRole = (roleId: string) => {
		const next = new Set(selectedRoleIds);
		if (next.has(roleId)) {
			next.delete(roleId);
		} else {
			next.add(roleId);
		}
		setSelectedRoleIds(next);
	};

	const allRoles = rolesData?.items ?? [];
	const displayName = user ? (user.user.full_name || user.user.email) : "User";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Manage roles</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Select roles for <span className="font-medium text-foreground">{displayName}</span>.
					</div>
					<div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
						{isLoading ? (
							<div className="p-2 text-sm text-muted-foreground">Loading roles...</div>
						) : (
							allRoles.map((role) => (
								<div key={role.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
									<Checkbox 
										id={role.id} 
										checked={selectedRoleIds.has(role.id)}
										onCheckedChange={() => toggleRole(role.id)}
									/>
									<label
										htmlFor={role.id}
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
									>
										{normalizeDisplay(role.name)}
										{role.is_system_role && <span className="ml-2 text-xs text-muted-foreground">(System)</span>}
									</label>
								</div>
							))
						)}
					</div>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={updateMutation.isPending}
					>
						{updateMutation.isPending ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
