import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
	Loader2,
	RefreshCw,
	Search,
	Upload,
	UserPlus,
	Users as UsersIcon,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TimezoneSelect } from "@/features/meta/components/TimezoneSelect";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { listOrgUsers } from "../api/orgUsers.api";
import { onboardOrgUser } from "../api/orgUsers.api";
import type {
	EmploymentStatus,
	OrgUsersListParams,
	PlatformStatus,
} from "../types";

const statusTone: Record<string, string> = {
	active: "border-emerald-200 bg-emerald-50 text-emerald-700",
	inactive: "border-slate-200 bg-slate-50 text-slate-700",
	terminated: "border-rose-200 bg-rose-50 text-rose-700",
	leave: "border-amber-200 bg-amber-50 text-amber-700",
	enabled: "border-emerald-200 bg-emerald-50 text-emerald-700",
	disabled: "border-slate-200 bg-slate-50 text-slate-700",
	locked: "border-amber-200 bg-amber-50 text-amber-700",
	pending: "border-amber-200 bg-amber-50 text-amber-700",
	accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
	expired: "border-rose-200 bg-rose-50 text-rose-700",
};

function StatusBadge({
	label,
	variant,
}: {
	label: string;
	variant: keyof typeof statusTone;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
				statusTone[variant],
			)}
		>
			{label}
		</span>
	);
}

export function OrgUsersListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [employmentStatus, setEmploymentStatus] = useState<
		EmploymentStatus | "all"
	>("all");
	const [platformStatus, setPlatformStatus] = useState<PlatformStatus | "all">(
		"all",
	);
	const [page, setPage] = useState(1);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const apiErrorToast = useApiErrorToast();

	const formSchema = z.object({
		email: z.string().email("Enter a valid email"),
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		phoneNumber: z.string().optional(),
		timezone: z.string().optional(),
		employeeId: z.string().optional(),
		employmentStartDate: z.string().optional(),
		employmentStatus: z.enum(["active", "inactive", "leave", "terminated"]),
	});

	type FormValues = z.infer<typeof formSchema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			employmentStatus: "active",
		},
	});

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	useEffect(() => {
		setPage(1);
	}, [employmentStatus, platformStatus, debouncedSearch]);

	const listParams = useMemo<OrgUsersListParams>(
		() => ({
			search: debouncedSearch || undefined,
			employment_status: employmentStatus === "all" ? undefined : employmentStatus,
			platform_status: platformStatus === "all" ? undefined : platformStatus,
			page,
			page_size: 10,
		}),
		[debouncedSearch, employmentStatus, platformStatus, page],
	);

	const {
		data,
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: queryKeys.orgUsers.list(listParams),
		queryFn: () => listOrgUsers(listParams),
		keepPreviousData: true,
	});

	useEffect(() => {
		if (isError) {
			let message = "Unable to load users right now. Please try again.";
			if (isAxiosError(error)) {
				const detail = error.response?.data;
				if (detail && typeof detail === "object" && "detail" in detail) {
					const detailValue = (detail as { detail?: unknown }).detail;
					if (typeof detailValue === "string" && detailValue.trim().length > 0) {
						message = detailValue;
					}
				} else if (typeof error.message === "string" && error.message.length > 0) {
					message = error.message;
				}
			}
			toast({
				variant: "destructive",
				title: "Failed to load users",
				description: message,
			});
		}
	}, [error, isError]);

	const onboardUser = async (values: FormValues) => {
		await onboardOrgUser({
			email: values.email,
			firstName: values.firstName,
			lastName: values.lastName,
			phoneNumber: values.phoneNumber || undefined,
			timezone: values.timezone || undefined,
			employeeId: values.employeeId || undefined,
			employmentStartDate: values.employmentStartDate || undefined,
			employmentStatus: values.employmentStatus as EmploymentStatus,
		});
	};

	const handleAddUser = async (values: FormValues) => {
		try {
			await onboardUser(values);
			toast({
				title: "User onboarded",
				description: "The user has been added to this organization.",
			});
			form.reset({
				email: "",
				firstName: "",
				lastName: "",
				employmentStatus: "active",
				employeeId: "",
				phoneNumber: "",
				timezone: "",
				employmentStartDate: "",
			});
			setIsAddModalOpen(false);
			refetch();
		} catch (err) {
			apiErrorToast(err, "Unable to onboard user right now.");
		}
	};

	const total = data?.total ?? 0;
	const pageSize = data?.page_size ?? listParams.page_size ?? 10;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const hasNext = page < totalPages;
	const hasPrev = page > 1;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Org users"
				subtitle="View organization users and core statuses. Data is scoped to your current organization."
				actions={
					<div className="flex gap-2">
						<Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm">
									<UserPlus className="mr-2 h-4 w-4" />
									Add user
								</Button>
							</DialogTrigger>
							<DialogContent className="w-[calc(100%-1.5rem)] max-w-lg max-h-[90vh]">
								<DialogHeader>
									<DialogTitle>Onboard a user</DialogTitle>
									<DialogDescription>
										Add a single user to this organization.
									</DialogDescription>
								</DialogHeader>
								<Form {...form}>
									<form className="flex flex-1 flex-col gap-4 overflow-hidden" onSubmit={form.handleSubmit(handleAddUser)}>
										<div className="flex-1 space-y-4 overflow-auto pr-1">
											<div className="grid gap-3 md:grid-cols-2">
												<FormField
													control={form.control}
													name="firstName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>First name</FormLabel>
															<FormControl>
																<Input placeholder="Ada" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="lastName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Last name</FormLabel>
															<FormControl>
																<Input placeholder="Lovelace" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email</FormLabel>
														<FormControl>
															<Input type="email" placeholder="user@example.com" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<div className="grid gap-3 md:grid-cols-2">
												<FormField
													control={form.control}
													name="phoneNumber"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Phone</FormLabel>
															<FormControl>
																<Input placeholder="+1 555 0100" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="timezone"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Timezone</FormLabel>
															<TimezoneSelect
																value={field.value}
																onChange={field.onChange}
																placeholder="Search timezones"
															/>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<div className="grid gap-3 md:grid-cols-2">
												<FormField
													control={form.control}
													name="employeeId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Employee ID</FormLabel>
															<FormControl>
																<Input placeholder="EMP-1234" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="employmentStartDate"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Employment start date</FormLabel>
															<FormControl>
																<Input type="date" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="employmentStatus"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Employment status</FormLabel>
														<FormControl>
															<Select
																value={field.value}
																onValueChange={(val) => field.onChange(val as EmploymentStatus)}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select status" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="active">Active</SelectItem>
																	<SelectItem value="inactive">Inactive</SelectItem>
																	<SelectItem value="leave">Leave</SelectItem>
																	<SelectItem value="terminated">Terminated</SelectItem>
																</SelectContent>
															</Select>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
											<Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
												Cancel
											</Button>
											<Button type="submit" className="sm:w-auto">
												Add user
											</Button>
										</DialogFooter>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
						<Button variant="outline" size="sm" asChild>
							<Link to="/app/users/onboard">
								<Upload className="mr-2 h-4 w-4" />
								Bulk onboarding
							</Link>
						</Button>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh
						</Button>
					</div>
				}
			/>
			<Card>
				<CardHeader className="gap-2">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
								<UsersIcon className="h-4 w-4" aria-hidden="true" />
							</div>
							<div className="flex flex-col">
								<CardTitle className="text-lg">User directory</CardTitle>
								<CardDescription>
									Paginated view of current org members with status signals.
								</CardDescription>
							</div>
						</div>
					</div>
					<div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search by name or email"
								className="pl-9"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
							/>
						</div>
						<Select
							value={employmentStatus}
							onValueChange={(value) =>
								setEmploymentStatus(value as EmploymentStatus | "all")
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Employment status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All employment</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
								<SelectItem value="leave">Leave</SelectItem>
								<SelectItem value="terminated">Terminated</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={platformStatus}
							onValueChange={(value) =>
								setPlatformStatus(value as PlatformStatus | "all")
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Platform status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All platform</SelectItem>
								<SelectItem value="enabled">Enabled</SelectItem>
								<SelectItem value="disabled">Disabled</SelectItem>
								<SelectItem value="locked">Locked</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="overflow-x-auto rounded-xl border border-border/70">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/40">
									<TableHead className="min-w-[180px]">User</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Employment</TableHead>
									<TableHead>Platform</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={8}>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Loader2 className="h-4 w-4 animate-spin" />
												Loading users…
											</div>
										</TableCell>
									</TableRow>
								) : isError ? (
									<TableRow>
										<TableCell colSpan={8}>
											<p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
												We couldn&rsquo;t load users right now. Please try again shortly.
											</p>
										</TableCell>
									</TableRow>
								) : data && data.items.length > 0 ? (
									data.items.map((membership) => {
										const name =
											membership.user.fullName ||
											[membership.user.firstName, membership.user.lastName]
												.filter(Boolean)
												.join(" ") ||
											"—";
										return (
											<TableRow key={membership.membershipId}>
												<TableCell className="font-semibold text-foreground">
													{name}
												</TableCell>
												<TableCell className="text-muted-foreground">
													{membership.user.email}
												</TableCell>
												<TableCell>
													<StatusBadge
														label={membership.employmentStatus}
														variant={membership.employmentStatus}
													/>
												</TableCell>
												<TableCell>
													<StatusBadge
														label={membership.platformStatus}
														variant={membership.platformStatus}
													/>
												</TableCell>
												<TableCell className="text-right">
													<Button variant="outline" size="sm" asChild>
														<Link to={`/app/users/${membership.membershipId}`}>
															View
														</Link>
													</Button>
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={8}>
											<div className="flex items-center justify-between rounded-md border border-dashed border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
												<span>No users found for this organization.</span>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<span>
								Page {page} of {totalPages} • {total} users
							</span>
							{isFetching ? (
								<span className="flex items-center gap-1 text-xs">
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
									Updating…
								</span>
							) : null}
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={!hasPrev || isFetching}
								onClick={() => setPage((prev) => Math.max(1, prev - 1))}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={!hasNext || isFetching}
								onClick={() => setPage((prev) => prev + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
