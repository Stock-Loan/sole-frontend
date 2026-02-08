import type { OrgUserListItem } from "@/entities/user/types";

export interface UserSettingsProfile extends OrgUserListItem {
	organization_name?: string | null;
	role_names?: string[] | null;
}

export type UserSettingsTabKey = "profile" | "security";

export interface UserSettingsInfoCardProps {
	label: string;
	value: string;
}

export interface UserSettingsSectionGridProps {
	items: UserSettingsInfoCardProps[];
}

export interface SelfProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: UserSettingsProfile | null | undefined;
	canEdit: boolean;
}
