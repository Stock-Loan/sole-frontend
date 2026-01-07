import {
	AlertTriangle,
	CheckCircle2,
	Server,
	XCircle,
} from "lucide-react";

export type ServiceStatus = "ok" | "degraded" | "down";

export interface StatusCheck {
	status: ServiceStatus;
	version?: string;
	message?: string;
}

export interface StatusSummary {
	status: ServiceStatus;
	ready: boolean;
	environment?: string;
	version?: string;
	timestamp: string;
	checks: {
		api?: StatusCheck;
		database?: StatusCheck;
		redis?: StatusCheck;
		[key: string]: StatusCheck | undefined;
	};
}

export interface ServiceCardProps {
	name: string;
	status: ServiceStatus;
	version?: string;
	message?: string;
	icon: typeof Server;
}

export const statusCopy: Record<
	ServiceStatus,
	{ label: string; icon: typeof CheckCircle2; className: string }
> = {
	ok: {
		label: "Healthy",
		icon: CheckCircle2,
		className: "text-emerald-600",
	},
	degraded: {
		label: "Degraded",
		icon: AlertTriangle,
		className: "text-amber-600",
	},
	down: {
		label: "Down",
		icon: XCircle,
		className: "text-destructive",
	},
};
