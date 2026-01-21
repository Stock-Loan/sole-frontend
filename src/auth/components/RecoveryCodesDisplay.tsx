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
import { PageContainer } from "@/shared/ui/PageContainer";
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
		<Card className="w-full max-w-lg border border-border/60 bg-card/95 shadow-xl backdrop-blur sm:rounded-2xl">
			<CardHeader className="space-y-3 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
					<Shield className="h-6 w-6" />
				</div>
				<CardTitle className="text-2xl font-semibold">
					Save your recovery codes
				</CardTitle>
				<CardDescription className="text-sm">
					These codes can be used to access your account if you lose access to
					your authenticator app. Each code can only be used once.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6 sm:px-8">
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

				<div className="rounded-lg border border-border/60 bg-muted/30 p-4">
					<div className="grid grid-cols-2 gap-2">
						{recoveryCodes.map((code, index) => (
							<code
								key={index}
								className="rounded bg-background px-3 py-2 text-center font-mono text-sm"
							>
								{code}
							</code>
						))}
					</div>
				</div>

				<div className="flex gap-2">
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
		return content;
	}

	return (
		<>
			<PublicHeader />
			<PageContainer className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-6">
				{content}
			</PageContainer>
		</>
	);
}
