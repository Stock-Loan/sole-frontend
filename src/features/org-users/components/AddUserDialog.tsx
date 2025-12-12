import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import type { EmploymentStatus, OnboardUserPayload } from "../types";

const formSchema = z.object({
	email: z.string().email("Enter a valid email"),
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	phone_number: z.string().optional(),
	timezone: z.string().optional(),
	employee_id: z.string().optional(),
	employment_start_date: z.string().optional(),
	employment_status: z.enum(["ACTIVE", "INACTIVE", "LEAVE", "TERMINATED"]),
});

export type AddUserFormValues = z.infer<typeof formSchema>;

const defaultValues: AddUserFormValues = {
	email: "",
	first_name: "",
	last_name: "",
	employment_status: "ACTIVE",
	timezone: "",
	phone_number: "",
	employee_id: "",
	employment_start_date: "",
};

interface AddUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: OnboardUserPayload) => Promise<void>;
	trigger: React.ReactNode;
}

export function AddUserDialog({
	open,
	onOpenChange,
	onSubmit,
	trigger,
}: AddUserDialogProps) {
	const apiErrorToast = useApiErrorToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<AddUserFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const handleSubmit = async (values: AddUserFormValues) => {
		setIsSubmitting(true);
		try {
			await onSubmit(values);
			form.reset(defaultValues);
			onOpenChange(false);
		} catch (err) {
			apiErrorToast(err, "Unable to onboard user right now.");
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
					</div>
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
					</div>
					<FormField
						control={form.control}
						name="employment_status"
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
				</form>
			</Form>
		</AppDialog>
	);
}
