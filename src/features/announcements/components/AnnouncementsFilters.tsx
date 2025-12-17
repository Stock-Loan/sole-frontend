import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterBar } from "@/components/common/FilterBar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ANNOUNCEMENT_STATUS_LABELS, ANNOUNCEMENT_STATUSES } from "../constants";
import type { AnnouncementsFiltersProps, AnnouncementStatus } from "../types";

export function AnnouncementsFilters({
	search,
	onSearchChange,
	status,
	onStatusChange,
}: AnnouncementsFiltersProps) {
	return (
		<FilterBar className="items-end gap-3 xl:flex-nowrap w-75">
			<div className="relative w-full flex-1 md:w-auto md:min-w-[240px]">
				<p className="mb-1 text-sm font-semibold text-foreground">
					Search announcements
				</p>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by title or body"
						className="pl-9"
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
					/>
				</div>
			</div>
			<div className="flex items-end gap-2">
				<div className="w-[200px]">
					<Select
						value={status}
						onValueChange={(value) =>
							onStatusChange(value === "ALL" ? "ALL" : (value as AnnouncementStatus))
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All statuses</SelectItem>
							{ANNOUNCEMENT_STATUSES.map((item) => (
								<SelectItem key={item} value={item}>
									{ANNOUNCEMENT_STATUS_LABELS[item]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</FilterBar>
	);
}
