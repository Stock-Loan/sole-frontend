import { Link } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { routes } from "@/lib/routes";
import { useMemo } from "react";

interface UserDropdownProps {
	showChevron?: boolean;
}

export function UserDropdown({ showChevron = false }: UserDropdownProps) {
	const { user, logout } = useAuth();
	const displayName =
		user?.full_name || user?.fullName || user?.email || "User";

	const initials = useMemo(() => {
		const nameForInitials = user?.full_name || user?.fullName;
		if (nameForInitials) {
			return nameForInitials
				.split(" ")
				.map((part) => part[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();
		}
		return user?.email?.slice(0, 2)?.toUpperCase() || "U";
	}, [user?.full_name, user?.fullName, user?.email]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="inline-flex items-center gap-4 border-none bg-transparent p-0 text-foreground outline-none ring-0 ring-offset-0 hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
				>
					<Avatar className="h-11 w-11 rounded-md border-0 bg-transparent">
						<AvatarFallback className="rounded-md text-foreground">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="hidden text-left text-xs leading-tight sm:block">
						<p className="font-semibold text-foreground">{displayName}</p>
						<p className="text-muted-foreground">
							{user?.email || "email@domain"}
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
					<Link to={routes.changePassword}>Change password</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
