import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { adminResetUserMfa } from "@/entities/user/api";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import type { AdminMfaResetButtonProps } from "@/entities/user/types";

export function AdminMfaResetButton({
	membershipId,
	userEmail,
	onReset,
}: AdminMfaResetButtonProps) {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const resetMutation = useMutation({
		mutationFn: () => adminResetUserMfa(membershipId),
		onSuccess: () => {
			toast({
				title: "MFA reset successful",
				description: `MFA has been reset for ${userEmail}. They will need to set up MFA again.`,
			});
			setConfirmOpen(false);
			queryClient.invalidateQueries({ queryKey: ["org-user", membershipId] });
			onReset?.();
		},
		onError: (error) => {
			apiErrorToast(
				error,
				"Failed to reset MFA. You may need to verify with step-up MFA.",
			);
		},
	});

	return (
		<>
			<Button
				variant="destructive"
				size="sm"
				onClick={() => setConfirmOpen(true)}
			>
				<ShieldOff className="mr-2 h-4 w-4" />
				Reset MFA
			</Button>

			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Reset user MFA</DialogTitle>
						<DialogDescription>
							This will remove all MFA settings for {userEmail}, including their
							recovery codes and remembered devices. They will need to set up
							MFA again on next login.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-muted-foreground">
							This action may require step-up MFA verification if your
							organization has enabled it for admin actions.
						</p>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmOpen(false)}
							disabled={resetMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => resetMutation.mutate()}
							disabled={resetMutation.isPending}
						>
							{resetMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting...
								</>
							) : (
								"Confirm reset"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
