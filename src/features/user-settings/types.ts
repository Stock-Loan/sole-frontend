import type { AuthUser } from "@/auth/types";

export type UserSettingsProfile = AuthUser;

export type UserSettingsTabKey = "profile" | "security";

export interface UserSettingsInfoCardProps {
	label: string;
	value: string;
}

export interface UserSettingsSectionGridProps {
	items: UserSettingsInfoCardProps[];
}
