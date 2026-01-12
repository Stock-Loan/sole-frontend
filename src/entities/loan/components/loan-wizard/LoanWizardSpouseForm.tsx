import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import type { LoanWizardSpouseFormProps } from "@/entities/loan/types";

export function LoanWizardSpouseForm({
	form,
	disabled = false,
	onFieldChange,
}: LoanWizardSpouseFormProps) {
	const handleFieldChange = (
		next: string,
		onChange: (value: string) => void
	) => {
		onChange(next);
		onFieldChange?.();
	};

	return (
		<Form {...form}>
			<div className="rounded-lg border border-border/70 p-4 shadow-sm">
				<p className="text-sm font-semibold text-foreground">
					Spouse/partner details
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Provide the required contact information for your spouse or partner.
				</p>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="spouse_first_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First name</FormLabel>
								<FormControl>
									<Input
										{...field}
										disabled={disabled}
										placeholder="First name"
										value={field.value ?? ""}
										onChange={(event) =>
											handleFieldChange(event.target.value, field.onChange)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="spouse_last_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last name</FormLabel>
								<FormControl>
									<Input
										{...field}
										disabled={disabled}
										placeholder="Last name"
										value={field.value ?? ""}
										onChange={(event) =>
											handleFieldChange(event.target.value, field.onChange)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="spouse_email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										{...field}
										disabled={disabled}
										placeholder="name@example.com"
										value={field.value ?? ""}
										onChange={(event) =>
											handleFieldChange(event.target.value, field.onChange)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="spouse_phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Phone</FormLabel>
								<FormControl>
									<Input
										{...field}
										disabled={disabled}
										placeholder="+1 555 0100"
										value={field.value ?? ""}
										onChange={(event) =>
											handleFieldChange(event.target.value, field.onChange)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="mt-4">
					<FormField
						control={form.control}
						name="spouse_address"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Address</FormLabel>
								<FormControl>
									<Input
										{...field}
										disabled={disabled}
										placeholder="Street address"
										value={field.value ?? ""}
										onChange={(event) =>
											handleFieldChange(event.target.value, field.onChange)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>
		</Form>
	);
}
