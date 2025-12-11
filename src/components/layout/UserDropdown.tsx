import { Link } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { routes } from "@/lib/routes";
import { useMemo } from "react";

export function UserDropdown() {
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
				<Button
					variant="outline"
					size="sm"
					className="inline-flex items-center gap-2 rounded-full"
				>
					<Avatar className="h-8 w-8">
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="hidden text-left text-xs leading-tight sm:block">
						<p className="font-semibold text-foreground">{displayName}</p>
						<p className="text-muted-foreground">
							{user?.email || "email@domain"}
						</p>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Signed in</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to={routes.status}>Status page</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
