import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { queryKeys } from "@/lib/queryKeys";
import {
	assignRoleToUser,
	listRoles,
	removeRoleFromUser,
} from "../api/roles.api";
import type { Role, UserRoleAssignmentsProps } from "../types";

export function UserRoleAssignments({
	membershipId,
	assignedRoleIds,
	onUpdated,
	disableAssignments = false,
	disableReason,
}: UserRoleAssignmentsProps) {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const queryClient = useQueryClient();
	const [selectedRoleId, setSelectedRoleId] = useState<string>("");

	const { data, isLoading, isError, refetch, isFetching } = useQuery({
		queryKey: queryKeys.roles.list(),
		queryFn: listRoles,
		staleTime: 5 * 60 * 1000,
	});

	const assignMutation = useMutation({
		mutationFn: (roleId: string) => assignRoleToUser(membershipId, roleId),
		onSuccess: () => {
			toast({
				title: "Role assigned",
				description: "The user has been updated.",
			});
			setSelectedRoleId("");
			queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.orgUsers.detail(membershipId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
			onUpdated?.();
		},
		onError: (err) =>
			apiErrorToast(
				err,
				"Unable to assign the role. Check permissions or try again."
			),
	});

	const removeMutation = useMutation({
		mutationFn: (roleId: string) => removeRoleFromUser(membershipId, roleId),
		onSuccess: () => {
			toast({
				title: "Role removed",
				description: "The user has been updated.",
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
			queryClient.invalidateQueries({
				queryKey: queryKeys.orgUsers.detail(membershipId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
			onUpdated?.();
		},
		onError: (err) =>
			apiErrorToast(
				err,
				"Unable to remove the role. Check permissions or try again."
			),
	});

	const roleList = useMemo(() => data?.items ?? [], [data?.items]);
	const assignedRoles = useMemo(() => {
		const ids = assignedRoleIds ?? [];
		return ids
			.map((id) => roleList.find((role) => role.id === id) || null)
			.filter(Boolean) as Role[];
	}, [assignedRoleIds, roleList]);

	const availableRoles = useMemo(
		() => roleList.filter((role) => !(assignedRoleIds ?? []).includes(role.id)),
		[roleList, assignedRoleIds]
	);

	const handleAssign = () => {
		if (!selectedRoleId) return;
		assignMutation.mutate(selectedRoleId);
	};

	return (
		<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">Roles</h3>
				{isFetching ? (
					<span className="text-xs text-muted-foreground">Updating…</span>
				) : null}
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading roles…</p>
			) : isError ? (
				<div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
					<span>Unable to load roles.</span>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				</div>
			) : (
				<div className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{assignedRoles.length ? (
							assignedRoles.map((role) => (
								<Badge
									key={role.id}
									variant="secondary"
									className="flex items-center gap-1"
								>
									<span className="font-semibold">{role.name}</span>
									{role.is_system_role ? (
										<span className="text-[10px] uppercase text-muted-foreground">
											System
										</span>
									) : (
										<button
											type="button"
											className="text-muted-foreground transition hover:text-destructive"
											onClick={() => removeMutation.mutate(role.id)}
											disabled={removeMutation.isPending}
											aria-label={`Remove role ${role.name}`}
										>
											<X className="h-3 w-3" />
										</button>
									)}
								</Badge>
							))
						) : (
							<p className="text-sm text-muted-foreground">
								No roles assigned.
							</p>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={selectedRoleId}
							onValueChange={setSelectedRoleId}
							disabled={
								assignMutation.isPending ||
								availableRoles.length === 0 ||
								disableAssignments
							}
						>
							<SelectTrigger className="min-w-[220px]">
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								{availableRoles.length === 0 ? (
									<SelectItem value="none" disabled>
										No roles available
									</SelectItem>
								) : (
									availableRoles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						<Button
							size="sm"
							onClick={handleAssign}
							disabled={
								!selectedRoleId ||
								assignMutation.isPending ||
								disableAssignments
							}
						>
							{assignMutation.isPending ? "Assigning..." : "Assign role"}
						</Button>
					</div>
					{disableAssignments && disableReason ? (
						<p className="text-xs text-muted-foreground">{disableReason}</p>
					) : null}
				</div>
			)}
		</div>
	);
}
