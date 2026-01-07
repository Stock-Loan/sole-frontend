import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { ROLE_FORM_DESCRIPTION, ROLE_FORM_TITLE } from "../constants";
import { RoleForm } from "./RoleForm";
import type { RoleFormDialogProps } from "../types";

export function RoleFormDialog({
	mode,
	open,
	onOpenChange,
	initialRole,
	onSubmit,
	isSubmitting = false,
}: RoleFormDialogProps) {
	const formId = "role-form-dialog";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>{ROLE_FORM_TITLE[mode]}</DialogTitle>
					<DialogDescription>
						{ROLE_FORM_DESCRIPTION[mode]}
					</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<RoleForm
						formId={formId}
						initialValues={
							initialRole
								? {
										name: initialRole.name,
										description: initialRole.description ?? "",
										permissions: initialRole.permissions ?? [],
									}
								: undefined
						}
						onSubmit={(values) => onSubmit(values, initialRole?.id)}
						isSubmitting={isSubmitting}
						disabled={initialRole?.is_system_role}
					/>
				</DialogBody>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" form={formId} disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
