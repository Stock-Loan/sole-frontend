import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AppDialog } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/components/ui/use-toast";
import type {
	AddUserDialogProps,
	AddUserFormValues,
	EmploymentStatus,
} from "../types";
import { extractErrorMessage, formSchema } from "@/lib/utils";
import { defaultValues } from "../constants";

export function AddUserDialog({
	open,
	onOpenChange,
	onSubmit,
	trigger,
}: AddUserDialogProps) {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<string>("");

	const form = useForm<AddUserFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const {
		data: countries = [],
		isLoading: isCountriesLoading,
		refetch: refetchCountries,
	} = useCountries();
	const {
		data: subdivisions = [],
		isLoading: isSubLoading,
		refetch: refetchSubdivisions,
	} = useSubdivisions(selectedCountry || null);

	const handleCountryChange = (code: string) => {
		setSelectedCountry(code);
		form.setValue("country", code);
		form.setValue("state", "");
	};

	const handleSubmit = async (values: AddUserFormValues) => {
		setIsSubmitting(true);
		try {
			await onSubmit(values);
			form.reset(defaultValues);
			onOpenChange(false);
		} catch (err) {
			const message =
				extractErrorMessage(err) || "Unable to onboard user right now.";
			toast({
				variant: "destructive",
				title: "Onboarding failed",
				description: message,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AppDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Onboard a user"
			description="Add a single user to this organization."
			trigger={trigger}
			actions={[
				{
					label: isSubmitting ? "Adding..." : "Add user",
					type: "submit",
					form: "add-user-form",
					loading: isSubmitting,
				},
			]}
		>
			<Form {...form}>
				<form
					id="add-user-form"
					className="space-y-4"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="first_name"
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
							name="middle_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Middle name</FormLabel>
									<FormControl>
										<Input placeholder="Middle name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="last_name"
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
						<FormField
							control={form.control}
							name="preferred_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Preferred name</FormLabel>
									<FormControl>
										<Input placeholder="Preferred name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="user@example.com"
											{...field}
										/>
									</FormControl>
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
									<FormControl>
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
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="phone_number"
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
										placeholder="Select timezone"
										contentClassName="max-h-64 overflow-auto"
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
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
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="state"
							render={({ field }) => (
								<FormItem>
									<FormLabel>State / Subdivision</FormLabel>
									<Select
										disabled={!selectedCountry || isSubLoading}
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={
													isSubLoading
														? "Loading subdivisions..."
														: "Select state"
												}
											/>
										</SelectTrigger>
										<SelectContent
											position="popper"
											className="max-h-64 overflow-auto"
										>
											{subdivisions.map((sub) => (
												<SelectItem key={sub.code} value={sub.code}>
													{sub.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{!isSubLoading &&
									subdivisions.length === 0 &&
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
						<FormField
							control={form.control}
							name="postal_code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Postal code</FormLabel>
									<FormControl>
										<Input placeholder="94105" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="address_line1"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address line 1</FormLabel>
									<FormControl>
										<Input placeholder="123 Main St" {...field} />
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
										<Input placeholder="Unit 5" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<FormField
							control={form.control}
							name="employee_id"
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
							name="employment_start_date"
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
						<FormField
							control={form.control}
							name="temporary_password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Temporary password (optional)</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="TempPass123!"
											autoComplete="new-password"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</form>
			</Form>
		</AppDialog>
	);
}
