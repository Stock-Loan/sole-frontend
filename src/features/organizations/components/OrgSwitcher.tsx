import { Building2, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTenant } from "@/features/organizations/hooks/useTenant";

export function OrgSwitcher() {
	const { orgs, currentOrgId, setCurrentOrgId } = useTenant();

	const currentOrg = useMemo(
		() => orgs.find((org) => org.id === currentOrgId) ?? orgs[0],
		[orgs, currentOrgId],
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="inline-flex items-center gap-2 rounded-full border-dashed"
				>
					<Building2 className="h-4 w-4" aria-hidden="true" />
					<span className="text-sm font-medium">
						{currentOrg?.name ?? "Select org"}
					</span>
					<ChevronDown className="h-4 w-4" aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56">
				{orgs.length === 0 ? (
					<DropdownMenuItem disabled>No orgs available</DropdownMenuItem>
				) : (
					orgs.map((org) => (
						<DropdownMenuItem key={org.id} onClick={() => setCurrentOrgId(org.id)}>
							<div className="flex flex-col">
								<span className="text-sm font-medium">{org.name}</span>
								{org.slug ? (
									<span className="text-xs text-muted-foreground">{org.slug}</span>
								) : null}
							</div>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
