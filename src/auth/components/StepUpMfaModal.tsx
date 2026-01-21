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
import { Input } from "@/shared/ui/input";
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
	RECOVERY_CODES_REGENERATE: "Recovery Codes Regeneration",
	USER_MFA_RESET: "User MFA Reset",
	SELF_MFA_RESET: "MFA Deactivation",
};

function getActionLabel(action: string): string {
	return ACTION_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();
}

// Actions that allow recovery code as an alternative
const RECOVERY_CODE_ALLOWED_ACTIONS = new Set([
	"LOGIN",
	"SELF_MFA_RESET",
	"USER_MFA_RESET",
	"RECOVERY_CODES_REGENERATE",
]);

export function StepUpMfaModal() {
	const ctx = useStepUpMfaOptional();
	const [code, setCode] = useState("");
	const [codeType, setCodeType] = useState<"totp" | "recovery">("totp");

	const allowRecoveryCode =
		ctx?.challenge?.action &&
		RECOVERY_CODE_ALLOWED_ACTIONS.has(ctx.challenge.action);

	const handleVerify = useCallback(async () => {
		if (!ctx) return;
		const expectedLength = codeType === "totp" ? 6 : 9;
		if (code.length !== expectedLength) return;
		try {
			await ctx.verifyStepUp(code, codeType);
			setCode("");
			setCodeType("totp");
		} catch {
			// Error is handled in context
		}
	}, [ctx, code, codeType]);

	const handleCancel = useCallback(() => {
		ctx?.cancelStepUp();
		setCode("");
		setCodeType("totp");
	}, [ctx]);

	const handleCodeChange = useCallback(
		(value: string) => {
			setCode(value);
			// Auto-submit when expected length is reached (only for TOTP)
			if (
				codeType === "totp" &&
				value.length === 6 &&
				ctx &&
				!ctx.isVerifying
			) {
				ctx
					.verifyStepUp(value, "totp")
					.then(() => {
						setCode("");
						setCodeType("totp");
					})
					.catch(() => {});
			}
		},
		[ctx, codeType],
	);

	const handleRecoveryCodeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			// Format: XXXX-XXXX (uppercase, alphanumeric)
			const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
			setCode(raw);
		},
		[],
	);

	const handleCodeTypeChange = useCallback((type: "totp" | "recovery") => {
		setCodeType(type);
		setCode("");
	}, []);

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
					{allowRecoveryCode && (
						<div className="flex gap-2 w-full justify-center">
							<Button
								type="button"
								variant={codeType === "totp" ? "default" : "outline"}
								size="sm"
								onClick={() => handleCodeTypeChange("totp")}
								disabled={isVerifying}
							>
								Authenticator
							</Button>
							<Button
								type="button"
								variant={codeType === "recovery" ? "default" : "outline"}
								size="sm"
								onClick={() => handleCodeTypeChange("recovery")}
								disabled={isVerifying}
							>
								Recovery code
							</Button>
						</div>
					)}
					<p className="text-sm text-muted-foreground text-center">
						{codeType === "totp"
							? "Enter the 6-digit code from your authenticator app"
							: "Enter one of your recovery codes"}
					</p>
					{codeType === "totp" ? (
						<OtpInput
							value={code}
							onChange={handleCodeChange}
							disabled={isVerifying}
							autoFocus
						/>
					) : (
						<Input
							type="text"
							value={code}
							onChange={handleRecoveryCodeChange}
							placeholder="XXXX-XXXX"
							maxLength={9}
							className="font-mono text-center tracking-widest text-lg w-40"
							disabled={isVerifying}
							autoFocus
						/>
					)}
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
						disabled={
							(codeType === "totp" ? code.length !== 6 : code.length !== 9) ||
							isVerifying
						}
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
