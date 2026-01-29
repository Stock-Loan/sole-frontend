import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { parseApiError } from "@/shared/api/errors";
import { Button } from "@/shared/ui/Button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { TabButtons } from "@/shared/ui/TabButtons";
import { AclPermissionsPicker } from "@/entities/acl/components/AclPermissionsPicker";
import {
	useCreateAclAssignment,
	useUpdateAclAssignment,
} from "@/entities/acl/hooks";
import type { AclAssignmentFormValues } from "@/entities/acl/types";
import {
	formatAclExpiresAt,
	fromDateTimeLocalValue,
	isAclExpired,
	toDateTimeLocalValue,
} from "@/entities/acl/utils";
import { aclAssignmentSchema } from "@/entities/acl/schemas";
import type { OrgUserListItem } from "@/entities/user/types";
import { AclUserPicker } from "@/areas/settings/components/AclUserPicker";
import type { AclAssignmentDialogProps } from "@/areas/settings/types";

export function AclAssignmentDialog({
	open,
	onOpenChange,
	mode,
	assignment,
	onSuccess,
}: AclAssignmentDialogProps) {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const isEdit = mode === "edit";

	const [selectedUser, setSelectedUser] = useState<OrgUserListItem | null>(
		null,
	);

	const defaultValues = useMemo<AclAssignmentFormValues>(
		() => ({
			user_id: assignment?.user_id ?? "",
			permissions: assignment?.permissions ?? [],
			effect: assignment?.effect ?? "allow",
			expires_at: toDateTimeLocalValue(assignment?.expires_at),
		}),
		[assignment],
	);

	const form = useForm<AclAssignmentFormValues>({
		resolver: zodResolver(aclAssignmentSchema),
		defaultValues,
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const createMutation = useCreateAclAssignment();
	const updateMutation = useUpdateAclAssignment();
	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const expiresAtValue = useWatch({
		control: form.control,
		name: "expires_at",
	});
	const expiresAtIso = fromDateTimeLocalValue(expiresAtValue);
	const expiresWarning = isAclExpired(expiresAtIso);

	const handleUserChange = (user: OrgUserListItem | null) => {
		setSelectedUser(user);
		form.setValue("user_id", user?.user.id ?? "", {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const handleSubmit = (values: AclAssignmentFormValues) => {
		const payload = {
			permissions: values.permissions,
			effect: values.effect,
			expires_at: fromDateTimeLocalValue(values.expires_at),
		};

		if (isEdit && assignment) {
			updateMutation.mutate(
				{ assignmentId: assignment.id, payload },
				{
					onSuccess: () => {
						toast({ title: "Assignment updated" });
						onOpenChange(false);
						onSuccess?.();
					},
					onError: (error) => {
						apiErrorToast(error, "Unable to update assignment.");
					},
				},
			);
			return;
		}

		const createPayload = {
			...payload,
			user_id: values.user_id,
		};
		createMutation.mutate(createPayload, {
			onSuccess: () => {
				toast({ title: "Assignment created" });
				onOpenChange(false);
				onSuccess?.();
			},
			onError: (error) => {
				const parsed = parseApiError(error);
				if (parsed.message.toLowerCase().includes("already exists")) {
					toast({
						variant: "destructive",
						title: "Assignment already exists for this user",
					});
					return;
				}
				apiErrorToast(error, "Unable to create assignment.");
			},
		});
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setSelectedUser(null);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit assignment" : "Add assignment"}
					</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-5">
					<Form {...form}>
						<form
							id="acl-assignment-form"
							className="space-y-5"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							{isEdit ? (
								<div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm">
									<div className="font-semibold text-foreground">
										{assignment?.full_name ||
											assignment?.email ||
											assignment?.user_id}
									</div>
									{assignment?.email ? (
										<div className="text-xs text-muted-foreground">
											{assignment.email}
										</div>
									) : null}
								</div>
							) : (
								<FormField
									control={form.control}
									name="user_id"
									render={() => (
										<FormItem>
											<FormLabel>User</FormLabel>
											<FormControl>
												<AclUserPicker
													value={selectedUser}
													onChange={handleUserChange}
													disabled={isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={form.control}
								name="permissions"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Permissions</FormLabel>
										<FormControl>
											<AclPermissionsPicker
												value={field.value ?? []}
												onChange={(next) =>
													form.setValue("permissions", next, {
														shouldDirty: true,
														shouldTouch: true,
													})
												}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="effect"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Effect</FormLabel>
										<div className="flex flex-wrap items-center gap-2">
											<TabButtons
												label="Allow"
												value="allow"
												active={field.value === "allow"}
												onSelect={field.onChange}
											/>
											<TabButtons
												label="Deny"
												value="deny"
												active={field.value === "deny"}
												onSelect={field.onChange}
											/>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="expires_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expires at (optional)</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
												value={field.value ?? ""}
												onChange={(event) => field.onChange(event.target.value)}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
										{expiresWarning ? (
											<p className="text-xs text-amber-600">
												Expires on {formatAclExpiresAt(expiresAtIso)} (already
												expired)
											</p>
										) : null}
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</DialogBody>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						form="acl-assignment-form"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting
							? isEdit
								? "Saving..."
								: "Creating..."
							: isEdit
								? "Save changes"
								: "Create assignment"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
