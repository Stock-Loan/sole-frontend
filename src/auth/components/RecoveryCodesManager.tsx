import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Key, Loader2, RefreshCcw, ShieldOff } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui/use-toast";
import { Dialog, DialogContent } from "@/shared/ui/Dialog/dialog";
import {
	getRecoveryCodesCount,
	regenerateRecoveryCodes,
	selfMfaReset,
} from "@/auth/api";
import { RecoveryCodesDisplay } from "@/auth/components/RecoveryCodesDisplay";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useAuth } from "@/auth/hooks/hooks";

export function RecoveryCodesManager() {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const queryClient = useQueryClient();
	const { setUser, user } = useAuth();
	const [showCodesDialog, setShowCodesDialog] = useState(false);
	const [newCodes, setNewCodes] = useState<string[]>([]);

	const { data: countData, isLoading } = useQuery({
		queryKey: ["mfa", "recovery-codes", "count"],
		queryFn: getRecoveryCodesCount,
	});

	const regenerateMutation = useMutation({
		mutationFn: regenerateRecoveryCodes,
		onSuccess: (data) => {
			if (data?.recovery_codes) {
				setNewCodes(data.recovery_codes);
				setShowCodesDialog(true);
				queryClient.invalidateQueries({
					queryKey: ["mfa", "recovery-codes", "count"],
				});
				toast({
					title: "Recovery codes regenerated",
					description: "Your new recovery codes are ready. Save them securely.",
				});
			}
		},
		onError: (error) => {
			apiErrorToast(error);
		},
	});

	const deactivateMutation = useMutation({
		mutationFn: selfMfaReset,
		onSuccess: () => {
			// Update user context to reflect MFA is now disabled
			if (user) {
				setUser({ ...user, mfa_enabled: false });
			}
			queryClient.invalidateQueries({ queryKey: ["self", "context"] });
			toast({
				title: "MFA deactivated",
				description:
					"Multi-factor authentication has been disabled on your account.",
			});
		},
		onError: (error) => {
			apiErrorToast(error);
		},
	});

	const handleRegenerate = () => {
		regenerateMutation.mutate();
	};

	const handleDeactivate = () => {
		deactivateMutation.mutate();
	};

	const handleCloseCodesDialog = () => {
		setShowCodesDialog(false);
		setNewCodes([]);
	};

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Loading...
			</div>
		);
	}

	const remainingCount = countData?.remaining_count ?? 0;

	return (
		<>
			<div className="space-y-4">
				{/* Recovery Codes Section */}
				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<Key className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-foreground">Recovery codes</span>
					</div>
					<p>
						Use recovery codes to sign in if you lose access to your
						authenticator app.
					</p>
					<p className="text-xs">
						Remaining codes:{" "}
						<span
							className={
								remainingCount <= 2 ? "font-semibold text-destructive" : ""
							}
						>
							{remainingCount} of 10
						</span>
						{remainingCount <= 2 && remainingCount > 0 && (
							<span className="ml-2 text-destructive">
								(Consider regenerating your codes)
							</span>
						)}
						{remainingCount === 0 && (
							<span className="ml-2 text-destructive">
								(No codes remaining - regenerate now!)
							</span>
						)}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={handleRegenerate}
						disabled={regenerateMutation.isPending}
						className="mt-2"
					>
						{regenerateMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Regenerating...
							</>
						) : (
							<>
								<RefreshCcw className="mr-2 h-4 w-4" />
								Regenerate codes
							</>
						)}
					</Button>
				</div>

				{/* Deactivate MFA Section */}
				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<ShieldOff className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-foreground">Deactivate MFA</span>
					</div>
					<p>
						Remove multi-factor authentication from your account. You will need
						to set it up again to re-enable.
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={handleDeactivate}
						disabled={deactivateMutation.isPending}
						className="mt-2 text-destructive hover:text-destructive"
					>
						{deactivateMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deactivating...
							</>
						) : (
							<>
								<ShieldOff className="mr-2 h-4 w-4" />
								Deactivate MFA
							</>
						)}
					</Button>
				</div>
			</div>

			{/* New Codes Display Dialog */}
			<Dialog open={showCodesDialog} onOpenChange={handleCloseCodesDialog}>
				<DialogContent className="max-w-lg">
					<RecoveryCodesDisplay
						recoveryCodes={newCodes}
						onContinue={handleCloseCodesDialog}
						isLoggedIn
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
