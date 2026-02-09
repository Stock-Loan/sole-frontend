import { useCallback } from "react";
import { useImpersonationOptional, useAuth } from "@/auth/hooks";
import { Button } from "@/shared/ui/Button";
import { Loader2, MonitorOff, ShieldAlert, User } from "lucide-react";

export function ImpersonationBanner() {
	const ctx = useImpersonationOptional();
	const auth = useAuth();

	const handleStop = useCallback(() => {
		void ctx?.stopImpersonation();
	}, [ctx]);

	if (!ctx || !ctx.isImpersonating) {
		return null;
	}

	const impersonatedName =
		ctx.impersonatedUserInfo?.fullName?.trim() ||
		auth.user?.full_name?.trim() ||
		"Impersonated user";
	const adminName =
		ctx.originalAdminInfo?.fullName?.trim() || "Administrator";

	return (
		<div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 animate-in slide-in-from-bottom duration-300">
			<div className="flex items-center gap-3 rounded-full border border-red-300 bg-red-600 px-5 py-2.5 text-white shadow-2xl ring-1 ring-red-600/20">
				<div className="flex items-center gap-2">
					<ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-200" />
					<div className="h-4 w-px bg-red-400/50" />
				</div>
				<div className="flex items-center gap-2 text-sm">
					<User className="h-3.5 w-3.5 text-red-200" />
					<span className="font-medium">{impersonatedName}</span>
					{adminName && <span className="text-red-200">(by {adminName})</span>}
				</div>
				<div className="h-4 w-px bg-red-400/50" />
				<Button
					variant="secondary"
					size="sm"
					onClick={handleStop}
					disabled={ctx.isLoading}
					className="h-7 rounded-full bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50 border-0 shadow-sm"
				>
					{ctx.isLoading ? (
						<>
							<Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
							Stopping…
						</>
					) : (
						<>
							<MonitorOff className="h-3.5 w-3.5 mr-1.5" />
							Stop impersonation
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
