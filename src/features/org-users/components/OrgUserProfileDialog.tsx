import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AppDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TimezoneSelect } from "@/features/meta/components/TimezoneSelect";
import { useCountries } from "@/features/meta/hooks/useCountries";
import { useSubdivisions } from "@/features/meta/hooks/useSubdivisions";
import { toast } from "@/components/ui/use-toast";
import { updateOrgUserProfile, updateOrgUserStatus } from "../api/orgUsers.api";
import {
	Dialog,
	DialogContent,
	DialogBody,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
	EmploymentStatus,
	OrgUserProfileDialogProps,
	ProfileFormValues,
	UpdateOrgUserProfilePayload,
} from "../types";
import { profileSchema } from "@/lib/utils";

export function OrgUserProfileDialog({
	open,
	onOpenChange,
	user,
	membershipId,
	onUpdated,
}: OrgUserProfileDialogProps) {
	const queryClient = useQueryClient();
	const [selectedCountry, setSelectedCountry] = useState<string>("");
	const currentEmploymentStatus = user?.membership.employment_status;
	const [pendingSubmit, setPendingSubmit] = useState<ProfileFormValues | null>(
		null
	);
	const [showConfirm, setShowConfirm] = useState(false);
	const displayName = useMemo(() => {
		if (!user) return "this user";
		const full =
			user.user.full_name ||
			[user.user.first_name, user.user.last_name]
				.filter(Boolean)
				.join(" ")
				.trim();
		return full || user.user.email || "this user";
	}, [user]);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			email: "",
			first_name: "",
			middle_name: "",
			last_name: "",
			preferred_name: "",
			timezone: "",
			phone_number: "",
			marital_status: "",
			country: "",
			state: "",
			address_line1: "",
			address_line2: "",
			postal_code: "",
			employee_id: "",
			employment_status: "ACTIVE",
		},
	});

	const {
		data: countries = [],
		isLoading: isCountriesLoading,
		refetch: refetchCountries,
	} = useCountries();
	const {
		data: subdivisions = [],
		isLoading: isSubdivisionsLoading,
		refetch: refetchSubdivisions,
	} = useSubdivisions(selectedCountry || null);

	useEffect(() => {
		if (!user) return;
		const normalizedEmployment = (user.membership.employment_status || "ACTIVE")
			.toString()
			.toUpperCase() as ProfileFormValues["employment_status"];
		form.reset({
			email: user.user.email || "",
			first_name: user.user.first_name || "",
			middle_name: user.user.middle_name || "",
			last_name: user.user.last_name || "",
			preferred_name: user.user.preferred_name || "",
			timezone: user.user.timezone || "",
			phone_number: user.user.phone_number || "",
			marital_status: user.user.marital_status || "",
			country: user.user.country || "",
			state: user.user.state || "",
			address_line1: user.user.address_line1 || "",
			address_line2: user.user.address_line2 || "",
			postal_code: user.user.postal_code || "",
			employee_id: user.membership.employee_id || "",
			employment_status: normalizedEmployment,
		});
		setTimeout(() => {
			setSelectedCountry(user.user.country || "");
		}, 0);
	}, [form, user]);

	const profileMutation = useMutation({
		mutationFn: async (values: ProfileFormValues) => {
			if (!membershipId) return;
			const { employment_status, ...profileValues } = values;
			const profilePayload: UpdateOrgUserProfilePayload = { ...profileValues };
			await updateOrgUserProfile(membershipId, profilePayload);
			if (employment_status) {
				await updateOrgUserStatus(membershipId, {
					employment_status: employment_status as EmploymentStatus,
				});
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) && query.queryKey[0] === "org-users",
			});
			onUpdated();
			onOpenChange(false);
			toast({
				title: "Profile updated",
				description: "User profile changes were saved.",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Update failed",
				description: "We could not save profile changes. Please try again.",
			});
		},
	});

	const handleCountryChange = (code: string) => {
		setSelectedCountry(code);
		form.setValue("country", code);
		form.setValue("state", "");
	};

	const subdivisionsOptions = useMemo(() => subdivisions ?? [], [subdivisions]);

	return (
		<>
			<AppDialog
				open={open}
				onOpenChange={onOpenChange}
				title="Edit profile"
				description="Update user contact, address, and employment status."
				actions={[
					{
						label: profileMutation.isPending ? "Saving..." : "Save profile",
						type: "submit",
						form: "profile-edit-form",
						loading: profileMutation.isPending,
					},
				]}
			>
				<Form {...form}>
					<form
						id="profile-edit-form"
						onSubmit={form.handleSubmit((values) => {
							const nextEmployment = values.employment_status?.toUpperCase();
							const currentEmployment = currentEmploymentStatus?.toUpperCase();
							if (
								currentEmployment === "ACTIVE" &&
								nextEmployment &&
								nextEmployment !== "ACTIVE"
							) {
								setPendingSubmit(values);
								setShowConfirm(true);
								return;
							}
							profileMutation.mutate(values);
						})}
						className="space-y-5"
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="middle_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Middle name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="preferred_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Preferred name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="phone_number"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone number</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="marital_status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Marital status</FormLabel>
										<Select
											value={field.value}
											onValueChange={(val) => field.onChange(val)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="SINGLE">Single</SelectItem>
												<SelectItem value="MARRIED">Married</SelectItem>
												<SelectItem value="DIVORCED">Divorced</SelectItem>
												<SelectItem value="WIDOWED">Widowed</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="employment_status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Employment status</FormLabel>
										<Select
											value={field.value}
											onValueChange={(val) =>
												field.onChange(val as EmploymentStatus)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="ACTIVE">Active</SelectItem>
												<SelectItem value="INACTIVE">Inactive</SelectItem>
												<SelectItem value="LEAVE">Leave</SelectItem>
												<SelectItem value="TERMINATED">Terminated</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="employee_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Employee ID</FormLabel>
										<FormControl>
											<Input {...field} />
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
										contentClassName="max-h-64 overflow-auto"
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Country</FormLabel>
										<Select
											value={field.value}
											onValueChange={(code) => handleCountryChange(code)}
										>
											<SelectTrigger>
												<SelectValue
													placeholder={
														isCountriesLoading
															? "Loading countries..."
															: "Select country"
													}
												/>
											</SelectTrigger>
									<SelectContent position="popper" className="max-h-64 overflow-auto">
										{countries.map((country) => (
											<SelectItem key={country.code} value={country.code}>
												{country.name}
											</SelectItem>
										))}
											</SelectContent>
										</Select>
										{!isCountriesLoading && countries.length === 0 ? (
											<button
												type="button"
												className="text-xs font-semibold text-primary underline"
												onClick={() => refetchCountries()}
											>
												Retry loading countries
											</button>
										) : null}
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State / Subdivision</FormLabel>
									<Select
										disabled={!selectedCountry || isSubdivisionsLoading}
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={
													isSubdivisionsLoading
														? "Loading subdivisions..."
														: "Select state"
												}
											/>
										</SelectTrigger>
										<SelectContent
											position="popper"
											className="max-h-64 overflow-auto"
										>
											{subdivisionsOptions.map((sub) => (
												<SelectItem key={sub.code} value={sub.code}>
													{sub.name}
												</SelectItem>
											))}
											</SelectContent>
										</Select>
										{!isSubdivisionsLoading &&
										subdivisionsOptions.length === 0 &&
										selectedCountry ? (
											<button
												type="button"
												className="text-xs font-semibold text-primary underline"
												onClick={() => refetchSubdivisions()}
											>
												Retry loading states
											</button>
										) : null}
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="address_line1"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address line 1</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address_line2"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address line 2</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="postal_code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Postal code</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
			</AppDialog>
			<Dialog open={showConfirm} onOpenChange={setShowConfirm}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>
							Update {displayName}'s employment status?
						</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground mt-2">
							Downgrading {displayName} from Active will remove all roles for
							this user in the current organization. Do you want to continue?
						</p>
					</DialogBody>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowConfirm(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (pendingSubmit) {
									profileMutation.mutate(pendingSubmit);
								}
								setShowConfirm(false);
								setPendingSubmit(null);
							}}
							disabled={profileMutation.isPending}
							variant="destructive"
						>
							Yes, continue
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
