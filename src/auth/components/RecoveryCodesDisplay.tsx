import {
	CheckCircle2,
	Copy,
	Download,
	Shield,
	AlertTriangle,
} from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/shared/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { PublicHeader } from "@/shared/ui/PublicHeader";
import { useToast } from "@/shared/ui/use-toast";
import type { RecoveryCodesDisplayProps } from "@/auth/types";

export function RecoveryCodesDisplay({
	recoveryCodes,
	onContinue,
	isLoggedIn = false,
}: RecoveryCodesDisplayProps) {
	const { toast } = useToast();
	const [hasSaved, setHasSaved] = useState(false);

	const handleCopy = useCallback(() => {
		const text = recoveryCodes.join("\n");
		navigator.clipboard.writeText(text);
		toast({
			title: "Copied!",
			description: "Recovery codes copied to clipboard.",
		});
		setHasSaved(true);
	}, [recoveryCodes, toast]);

	const handleDownload = useCallback(() => {
		const text = recoveryCodes.join("\n");
		const blob = new Blob([text], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "sole-mfa-recovery-codes.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast({
			title: "Downloaded!",
			description: "Recovery codes saved to file.",
		});
		setHasSaved(true);
	}, [recoveryCodes, toast]);

	const content = (
		<Card className="w-full max-w-md border border-border/60 bg-card/95 shadow-xl backdrop-blur sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:rounded-2xl">
			<CardHeader className="space-y-3 px-4 text-center sm:px-6">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
					<Shield className="h-6 w-6" />
				</div>
				<CardTitle className="text-xl font-semibold sm:text-2xl">
					Save your recovery codes
				</CardTitle>
				<CardDescription className="text-sm">
					These codes can be used to access your account if you lose access to
					your authenticator app. Each code can only be used once.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 px-4 sm:space-y-6 sm:px-6 md:px-8">
				<div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
					<AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
					<div>
						<p className="font-semibold text-destructive">Important</p>
						<p className="text-sm text-muted-foreground">
							Store these codes in a safe place. You won't be able to see them
							again after leaving this page.
						</p>
					</div>
				</div>

				<div className="rounded-lg border border-border/60 bg-muted/30 p-3 sm:p-4">
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-5 md:gap-3">
						{recoveryCodes.map((code, index) => (
							<code
								key={index}
								className="rounded bg-background px-2 py-1.5 text-center font-mono text-xs sm:px-3 sm:py-2 sm:text-sm"
							>
								{code}
							</code>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row">
					<Button variant="outline" className="flex-1" onClick={handleCopy}>
						<Copy className="mr-2 h-4 w-4" />
						Copy
					</Button>
					<Button variant="outline" className="flex-1" onClick={handleDownload}>
						<Download className="mr-2 h-4 w-4" />
						Download
					</Button>
				</div>

				<Button className="w-full" onClick={onContinue} disabled={!hasSaved}>
					{hasSaved ? (
						<>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							Continue to application
						</>
					) : (
						"Save codes first to continue"
					)}
				</Button>

				{!hasSaved && (
					<p className="text-center text-xs text-muted-foreground">
						Please copy or download your recovery codes before continuing.
					</p>
				)}
			</CardContent>
		</Card>
	);

	if (isLoggedIn) {
		return (
			<div className="flex max-h-[90vh] flex-col overflow-hidden">
				<div className="overflow-y-auto">{content}</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background">
			<PublicHeader />
			<div className="flex-1 overflow-y-auto">
				<div className="flex min-h-full justify-center px-4 py-6 pb-12 sm:px-6 lg:px-8 xl:items-center">
					{content}
				</div>
			</div>
		</div>
	);
}
