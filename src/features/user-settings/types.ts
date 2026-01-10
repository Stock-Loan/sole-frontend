import type { OrgUserListItem } from "@/entities/user/types";

export type UserSettingsProfile = OrgUserListItem;

export type UserSettingsTabKey = "profile" | "security";

export interface UserSettingsInfoCardProps {
	label: string;
	value: string;
}

export interface UserSettingsSectionGridProps {
	items: UserSettingsInfoCardProps[];
}
