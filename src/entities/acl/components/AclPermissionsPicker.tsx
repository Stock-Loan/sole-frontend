import { useMemo } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { PERMISSION_CATALOG } from "@/shared/permissions/permissionCodes";
import type { AclPermissionsPickerProps } from "@/entities/acl/types";

export function AclPermissionsPicker({
	value,
	onChange,
	disabled,
}: AclPermissionsPickerProps) {
	const selected = useMemo(() => new Set(value), [value]);

	const togglePermission = (code: string) => {
		const next = new Set(selected);
		if (next.has(code)) {
			next.delete(code);
		} else {
			next.add(code);
		}
		onChange(Array.from(next));
	};

	return (
		<div className="space-y-3">
			{PERMISSION_CATALOG.map((group) => (
				<div
					key={group.category}
					className="rounded-lg border border-border/70 bg-muted/30 px-3 py-3"
				>
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{group.category}
					</p>
					<div className="mt-2 grid gap-2 md:grid-cols-2">
						{group.codes.map((code) => {
							const checked = selected.has(code);
							return (
								<label
									key={code}
									className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/60"
								>
									<Checkbox
										checked={checked}
										disabled={disabled}
										onCheckedChange={() => togglePermission(code)}
									/>
									<span className="font-medium text-foreground">{code}</span>
								</label>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
