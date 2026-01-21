import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { areas } from "@/app/navigation/areas";
import { navConfig } from "@/app/navigation/nav-config";
import { usePermissions } from "@/auth/hooks/hooks";
import { useActiveArea } from "@/app/navigation/useActiveArea";
import { cn } from "@/shared/lib/utils";

function canSeeArea(
	areaId: keyof typeof navConfig,
	can: (permission: string | string[]) => boolean,
) {
	const items = navConfig[areaId] ?? [];
	return items.some((item) => {
		if (!item.permissions) return true;
		const required = Array.isArray(item.permissions)
			? item.permissions
			: [item.permissions];
		return required.some((perm) => can(perm));
	});
}

export function AreaSwitcher() {
	const navigate = useNavigate();
	const activeArea = useActiveArea();
	const { can } = usePermissions();

	const visibleAreas = useMemo(
		() => areas.filter((area) => canSeeArea(area.id, can)),
		[can],
	);

	const currentArea =
		visibleAreas.find((area) => area.id === activeArea.id) ??
		visibleAreas[0] ??
		activeArea ??
		areas[0];

	if (!currentArea) {
		return null;
	}

	if (visibleAreas.length <= 1) {
		const Icon = currentArea.icon;
		return (
			<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 text-sm font-semibold">
				<Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
				<span>{currentArea.label}</span>
			</div>
		);
	}

	const Icon = currentArea.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="inline-flex items-center gap-2 rounded-full border-border/70 bg-background/80"
				>
					<Icon className="h-4 w-4" aria-hidden="true" />
					<span className="text-sm font-medium">{currentArea.label}</span>
					<ChevronDown className="h-4 w-4" aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-64">
				{visibleAreas.map((area) => {
					const AreaIcon = area.icon;
					return (
						<DropdownMenuItem
							key={area.id}
							onClick={() => navigate(area.path)}
							className={cn(
								"flex items-start gap-3",
								area.id === currentArea.id && "bg-muted/40",
							)}
						>
							<AreaIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
							<div className="flex flex-col">
								<span className="text-sm font-semibold">{area.label}</span>
								{area.description ? (
									<span className="text-xs text-muted-foreground">
										{area.description}
									</span>
								) : null}
							</div>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
