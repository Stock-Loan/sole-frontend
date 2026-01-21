import { useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogBody,
	DialogFooter,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { OtpInput } from "./OtpInput";
import { useStepUpMfaOptional } from "../hooks/useStepUpMfa";
import { Loader2, ShieldCheck } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
	STOCK_GRANT_ASSIGNMENT: "Stock Grant Assignment",
	LOAN_SUBMISSION: "Loan Submission",
	LOAN_PAYMENT_RECORD: "Loan Payment Recording",
	WORKFLOW_COMPLETE: "Workflow Completion",
	ORG_SETTINGS_CHANGE: "Organization Settings Change",
	USER_PROFILE_EDIT: "User Profile Edit",
	ROLE_ASSIGNMENT: "Role Assignment",
	LOGIN: "Login",
};

function getActionLabel(action: string): string {
	return ACTION_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();
}

export function StepUpMfaModal() {
	const ctx = useStepUpMfaOptional();
	const [code, setCode] = useState("");

	const handleVerify = useCallback(async () => {
		if (!ctx || code.length !== 6) return;
		try {
			await ctx.verifyStepUp(code);
			setCode("");
		} catch {
			// Error is handled in context
		}
	}, [ctx, code]);

	const handleCancel = useCallback(() => {
		ctx?.cancelStepUp();
		setCode("");
	}, [ctx]);

	const handleCodeChange = useCallback(
		(value: string) => {
			setCode(value);
			// Auto-submit when 6 digits are entered
			if (value.length === 6 && ctx && !ctx.isVerifying) {
				ctx
					.verifyStepUp(value)
					.then(() => setCode(""))
					.catch(() => {});
			}
		},
		[ctx],
	);

	if (!ctx) return null;

	const { isStepUpRequired, challenge, isVerifying, error } = ctx;

	return (
		<Dialog
			open={isStepUpRequired}
			onOpenChange={(open) => !open && handleCancel()}
		>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5 text-primary" />
						Verification Required
					</DialogTitle>
					<DialogDescription>
						{challenge
							? `Enter your authentication code to confirm ${getActionLabel(challenge.action)}.`
							: "Enter your authentication code to continue."}
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex flex-col items-center gap-4 py-6">
					<p className="text-sm text-muted-foreground text-center">
						Enter the 6-digit code from your authenticator app
					</p>
					<OtpInput
						value={code}
						onChange={handleCodeChange}
						disabled={isVerifying}
						autoFocus
					/>
					{error && (
						<p className="text-sm text-destructive text-center">{error}</p>
					)}
				</DialogBody>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isVerifying}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleVerify}
						disabled={code.length !== 6 || isVerifying}
					>
						{isVerifying ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Verifying...
							</>
						) : (
							"Verify"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
