import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { TimezoneSelect } from "@/entities/meta/components/TimezoneSelect";
import { useCountries } from "@/entities/meta/useCountries";
import { useSubdivisions } from "@/entities/meta/useSubdivisions";
import { selfProfileSchema } from "@/entities/user/schemas";
import type {
	SelfProfileFormValues,
	UpdateSelfProfilePayload,
} from "@/entities/user/types";
import type { SelfProfileDialogProps } from "../types";
import { useUpdateSelfProfile } from "../hooks";

export function SelfProfileDialog({
	open,
	onOpenChange,
	profile,
	canEdit,
}: SelfProfileDialogProps) {
	const updateProfile = useUpdateSelfProfile();

	const form = useForm<SelfProfileFormValues>({
		resolver: zodResolver(selfProfileSchema),
		defaultValues: {
			preferred_name: "",
			timezone: "",
			phone_number: "",
			marital_status: "",
			country: "",
			state: "",
			address_line1: "",
			address_line2: "",
			postal_code: "",
		},
	});

	const {
		data: countries = [],
		isLoading: isCountriesLoading,
		refetch: refetchCountries,
	} = useCountries();
	const selectedCountry = useWatch({
		control: form.control,
		name: "country",
	}) ?? "";
	const {
		data: subdivisions = [],
		isLoading: isSubdivisionsLoading,
		refetch: refetchSubdivisions,
	} = useSubdivisions(selectedCountry || null);

	useEffect(() => {
		if (!profile) return;
		form.reset({
			preferred_name: profile.user.preferred_name || "",
			timezone: profile.user.timezone || "",
			phone_number: profile.user.phone_number || "",
			marital_status: profile.user.marital_status || "",
			country: profile.user.country_code || profile.user.country || "",
			state: profile.user.state_code || profile.user.state || "",
			address_line1: profile.user.address_line1 || "",
			address_line2: profile.user.address_line2 || "",
			postal_code: profile.user.postal_code || "",
		});
	}, [profile, form]);

	const countryOptions = useMemo(
		() =>
			(Array.isArray(countries) ? countries : []).map((country) => ({
				code: country.code,
				name: country.name,
			})),
		[countries],
	);

	const subdivisionOptions = useMemo(
		() =>
			(Array.isArray(subdivisions) ? subdivisions : []).map((subdivision) => ({
				code: subdivision.code,
				name: subdivision.name,
			})),
		[subdivisions],
	);

	const handleSubmit = async (values: SelfProfileFormValues) => {
		if (!canEdit) return;
		const payload: UpdateSelfProfilePayload = {
			preferred_name: values.preferred_name || undefined,
			timezone: values.timezone,
			phone_number: values.phone_number,
			marital_status: values.marital_status,
			country: values.country,
			state: values.state,
			address_line1: values.address_line1,
			address_line2: values.address_line2 || undefined,
			postal_code: values.postal_code,
		};
		await updateProfile.mutateAsync(payload);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>Update your profile</DialogTitle>
				</DialogHeader>
				<DialogBody>
					{!canEdit ? (
						<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
							Profile editing is disabled for your organization. Contact your
							admin if you need changes.
						</div>
					) : null}
					<Form {...form}>
						<form
							id="self-profile-form"
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							<section className="space-y-3">
								<p className="text-sm font-semibold text-foreground">
									Personal
								</p>
								<div className="grid gap-3 sm:grid-cols-2">
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
									<FormField
										control={form.control}
										name="marital_status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Marital status *</FormLabel>
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
								</div>
							</section>
							<section className="space-y-3">
								<p className="text-sm font-semibold text-foreground">
									Contact
								</p>
								<div className="grid gap-3 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="phone_number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone number *</FormLabel>
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
												<FormLabel>Timezone *</FormLabel>
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
							</section>
							<section className="space-y-3">
								<p className="text-sm font-semibold text-foreground">
									Address
								</p>
								<div className="grid gap-3 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="country"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Country *</FormLabel>
												<Select
													value={field.value}
													onValueChange={(val) => {
														field.onChange(val);
														form.setValue("state", "");
													}}
													disabled={isCountriesLoading}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select country" />
													</SelectTrigger>
													<SelectContent>
														{countryOptions.length === 0 ? (
															<SelectItem value="none" disabled>
																No countries found
															</SelectItem>
														) : (
															countryOptions.map((country) => (
																<SelectItem
																	key={country.code}
																	value={country.code}
																>
																	{country.name}
																</SelectItem>
															))
														)}
													</SelectContent>
												</Select>
												{!isCountriesLoading && countryOptions.length === 0 ? (
													<Button
														variant="ghost"
														size="sm"
														type="button"
														onClick={() => refetchCountries()}
													>
														Retry
													</Button>
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
												<FormLabel>State *</FormLabel>
												{subdivisionOptions.length > 0 ? (
													<Select
														value={field.value}
														onValueChange={(val) => field.onChange(val)}
														disabled={isSubdivisionsLoading}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select state" />
														</SelectTrigger>
														<SelectContent>
															{subdivisionOptions.map((state) => (
																<SelectItem
																	key={state.code}
																	value={state.code}
																>
																	{state.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												) : (
													<FormControl>
														<Input
															placeholder="State or region"
															{...field}
														/>
													</FormControl>
												)}
												{!isSubdivisionsLoading &&
												selectedCountry &&
												subdivisionOptions.length === 0 ? (
													<Button
														variant="ghost"
														size="sm"
														type="button"
														onClick={() => refetchSubdivisions()}
													>
														Retry
													</Button>
												) : null}
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="address_line1"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Address line 1 *</FormLabel>
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
									<FormField
										control={form.control}
										name="postal_code"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Postal code *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</section>
						</form>
					</Form>
				</DialogBody>
				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="self-profile-form"
						disabled={!canEdit || updateProfile.isPending}
					>
						{updateProfile.isPending ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
