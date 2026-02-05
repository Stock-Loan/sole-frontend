import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useAuth, useMe } from "@/auth/hooks";
import { routes } from "@/shared/lib/routes";
import { useUserSettings } from "@/features/user-settings/hooks";
import type { UserDropdownProps } from "./types";

const USER_ID_MAX_CHARS = 15;

function truncateValue(value: string, maxChars: number) {
	if (value.length <= maxChars) return value;
	if (maxChars <= 3) return value.slice(0, maxChars);
	return `${value.slice(0, maxChars - 3)}...`;
}

export function UserDropdown({ showChevron = false }: UserDropdownProps) {
	const { user, setUser, logout } = useAuth();

	const { data: profile } = useMe();

	useEffect(() => {
		if (profile) {
			setUser(profile);
		}
	}, [profile, setUser]);

	const { data: selfProfile } = useUserSettings();
	const displayUser = selfProfile?.user ?? profile ?? user;
	const displayName = useMemo(() => {
		const first = selfProfile?.user.first_name;
		const last = selfProfile?.user.last_name;
		if (first || last) {
			return [first, last].filter(Boolean).join(" ").trim();
		}
		return displayUser?.full_name || displayUser?.email || "User";
	}, [
		selfProfile?.user.first_name,
		selfProfile?.user.last_name,
		displayUser?.email,
		displayUser?.full_name,
	]);

	const secondaryLabel = useMemo(() => {
		return (
			selfProfile?.membership.employee_id ||
			displayUser?.email ||
			displayUser?.id ||
			"email@domain"
		);
	}, [selfProfile?.membership.employee_id, displayUser?.email, displayUser?.id]);

	const secondaryDisplay = useMemo(
		() => truncateValue(secondaryLabel, USER_ID_MAX_CHARS),
		[secondaryLabel],
	);

	const initials = useMemo(() => {
		const nameForInitials =
			selfProfile?.user.first_name || selfProfile?.user.last_name
				? displayName
				: displayUser?.full_name || displayName;
		if (nameForInitials) {
			return nameForInitials
				.split(" ")
				.map((part) => part[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();
		}
		return displayUser?.email?.slice(0, 2)?.toUpperCase() || "U";
	}, [
		displayName,
		selfProfile?.user.first_name,
		selfProfile?.user.last_name,
		displayUser?.email,
		displayUser?.full_name,
	]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="inline-flex items-center gap-3 bg-transparent p-0 text-foreground outline-none ring-0 ring-offset-0 hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
				>
					<Avatar className="h-11 w-11 rounded-lg border border-border/60 bg-muted/50">
						<AvatarFallback className="rounded-lg bg-primary/10 text-sm font-semibold text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="hidden text-left text-xs leading-tight sm:block">
						<p className="font-semibold text-foreground">{displayName}</p>
						<p className="text-muted-foreground" title={secondaryLabel}>
							{secondaryDisplay}
						</p>
					</div>
					{showChevron ? (
						<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
					) : null}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Signed in</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to={routes.workspaceSettings}>My profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to={routes.changePassword}>Change password</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => void logout()}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
