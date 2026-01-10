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
import { useOrgUserByEmail } from "@/entities/user/hooks";
import type { UserDropdownProps } from "./types";

export function UserDropdown({ showChevron = false }: UserDropdownProps) {
	const { user, setUser, logout } = useAuth();

	const { data: profile } = useMe();

	const currentEmail = profile?.email || user?.email || "";

	const { data: orgUserItem } = useOrgUserByEmail(currentEmail);

	useEffect(() => {
		if (profile) {
			setUser(profile);
		}
	}, [profile, setUser]);

	const displayUser = orgUserItem?.user ?? profile ?? user;
	const displayName = useMemo(() => {
		const first = orgUserItem?.user.first_name;
		const last = orgUserItem?.user.last_name;
		if (first || last) {
			return [first, last].filter(Boolean).join(" ").trim();
		}
		return displayUser?.full_name || displayUser?.email || "User";
	}, [
		displayUser?.email,
		displayUser?.full_name,
		orgUserItem?.user.first_name,
		orgUserItem?.user.last_name,
	]);

	const initials = useMemo(() => {
		const nameForInitials =
			orgUserItem?.user.first_name || orgUserItem?.user.last_name
				? displayName
				: displayUser?.full_name;
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
		displayUser?.email,
		displayUser?.full_name,
		orgUserItem?.user.first_name,
		orgUserItem?.user.last_name,
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
						<p className="text-muted-foreground">
							{orgUserItem?.membership.employee_id ||
								displayUser?.email ||
								"email@domain"}
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
				<DropdownMenuItem onClick={() => void logout()}>Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
