import { useCallback } from "react";
import { useInactivityOptional } from "../hooks/useInactivity";
import { Button } from "@/shared/ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	if (mins > 0) {
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}
	return `${secs}s`;
}

export function InactivityWarningBanner() {
	const ctx = useInactivityOptional();

	const handleStayLoggedIn = useCallback(() => {
		ctx?.refreshActivity();
	}, [ctx]);

	if (!ctx || !ctx.isWarningVisible || ctx.secondsRemaining === null) {
		return null;
	}

	const { secondsRemaining, isRefreshing } = ctx;

	return (
		<div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-3 px-4 shadow-lg animate-in slide-in-from-top duration-300">
			<div className="container mx-auto flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<AlertTriangle className="h-5 w-5 flex-shrink-0" />
					<p className="text-sm font-medium">
						Your session will expire in{" "}
						<span className="font-bold tabular-nums">
							{formatTime(secondsRemaining)}
						</span>{" "}
						due to inactivity
					</p>
				</div>
				<Button
					variant="secondary"
					size="sm"
					onClick={handleStayLoggedIn}
					disabled={isRefreshing}
					className="bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-600"
				>
					{isRefreshing ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Refreshing...
						</>
					) : (
						"Stay logged in"
					)}
				</Button>
			</div>
		</div>
	);
}
