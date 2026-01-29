import { Badge } from "@/shared/ui/badge";
import type { AclPermissionTagsProps } from "@/entities/acl/types";

export function AclPermissionTags({
	permissions,
	maxVisible = 3,
}: AclPermissionTagsProps) {
	if (!permissions || permissions.length === 0) {
		return <span className="text-xs text-muted-foreground">—</span>;
	}

	const visible = permissions.slice(0, maxVisible);
	const remaining = permissions.length - visible.length;

	return (
		<div className="flex flex-wrap gap-1">
			{visible.map((permission) => (
				<Badge key={permission} variant="secondary" className="text-xs">
					{permission}
				</Badge>
			))}
			{remaining > 0 ? (
				<Badge variant="outline" className="text-xs">
					+{remaining}
				</Badge>
			) : null}
		</div>
	);
}
