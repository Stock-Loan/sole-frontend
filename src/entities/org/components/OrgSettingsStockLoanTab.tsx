import { useWatch } from "react-hook-form";
import { Coins, FileText } from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import type { OrgSettingsStockLoanTabProps } from "../types";
import { repaymentMethodOptions, interestTypeOptions } from "../constants";

function toggleValue<T extends string>(
	current: T[],
	value: T,
	checked: boolean,
) {
	if (checked) {
		return current.includes(value) ? current : [...current, value];
	}
	return current.filter((item) => item !== value);
}

export function OrgSettingsStockLoanTab({
	form,
	canManage,
	isSubmitting,
}: OrgSettingsStockLoanTabProps) {
	const enforceServiceDuration = useWatch({
		control: form.control,
		name: "enforce_service_duration_rule",
	});
	const enforceMinVested = useWatch({
		control: form.control,
		name: "enforce_min_vested_to_exercise",
	});
	const selectedInterestTypes = useWatch({
		control: form.control,
		name: "allowed_interest_types",
	});
	const requireDownPayment = useWatch({
		control: form.control,
		name: "require_down_payment",
	});

	return (
		<div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="border-b border-border/70 px-6 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
							<Coins className="h-4 w-4" />
						</div>
						<div>
							<h3 className="text-base font-semibold">Stock program</h3>
							<p className="text-xs text-muted-foreground">
								Define rules for exercise eligibility and vesting.
							</p>
						</div>
					</div>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden px-6 py-6">
					<div className="space-y-6">
						<div className="space-y-4 rounded-lg border p-4 shadow-sm">
							<FormField
								control={form.control}
								name="enforce_service_duration_rule"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												Require minimum service duration
											</FormLabel>
											<div className="text-sm text-muted-foreground">
												Block exercises until an employee meets the minimum
												service duration.
											</div>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={(checked) => {
													const nextValue = Boolean(checked);
													field.onChange(nextValue);
													if (!nextValue) {
														form.setValue("min_service_duration_years", null, {
															shouldDirty: true,
														});
													}
												}}
												disabled={!canManage || isSubmitting}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							{enforceServiceDuration && (
								<div className="pl-1 pt-2">
									<FormField
										control={form.control}
										name="min_service_duration_years"
										render={({ field }) => (
											<FormItem className="max-w-xs">
												<FormLabel>Minimum service duration (years)</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														max={100}
														step="0.1"
														{...field}
														value={field.value ?? ""}
														onChange={(event) => {
															const nextValue =
																event.target.value === ""
																	? null
																	: event.target.valueAsNumber;
															field.onChange(
																Number.isNaN(nextValue) ? null : nextValue,
															);
														}}
														disabled={!canManage || isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}
						</div>

						<div className="space-y-4 rounded-lg border p-4 shadow-sm">
							<FormField
								control={form.control}
								name="enforce_min_vested_to_exercise"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												Require minimum vested shares
											</FormLabel>
											<div className="text-sm text-muted-foreground">
												Require a minimum cumulative vested share count before
												exercising.
											</div>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={(checked) => {
													const nextValue = Boolean(checked);
													field.onChange(nextValue);
													if (!nextValue) {
														form.setValue(
															"min_vested_shares_to_exercise",
															null,
															{ shouldDirty: true },
														);
													}
												}}
												disabled={!canManage || isSubmitting}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							{enforceMinVested && (
								<div className="pl-1 pt-2">
									<FormField
										control={form.control}
										name="min_vested_shares_to_exercise"
										render={({ field }) => (
											<FormItem className="max-w-xs">
												<FormLabel>Minimum vested shares to exercise</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														max={1_000_000_000}
														{...field}
														value={field.value ?? ""}
														onChange={(event) => {
															const nextValue =
																event.target.value === ""
																	? null
																	: event.target.valueAsNumber;
															field.onChange(
																Number.isNaN(nextValue) ? null : nextValue,
															);
														}}
														disabled={!canManage || isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="border-b border-border/70 px-6 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
							<FileText className="h-4 w-4" />
						</div>
						<div>
							<h3 className="text-base font-semibold">Loan settings</h3>
							<p className="text-xs text-muted-foreground">
								Define repayment, interest, and policy defaults for employee
								loans.
							</p>
						</div>
					</div>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto scrollbar-hidden px-6 py-6">
					<div className="space-y-6">
						<FormField
							control={form.control}
							name="allowed_repayment_methods"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Repayment methods</FormLabel>
									<div className="mt-2 grid gap-3 md:grid-cols-2">
										{repaymentMethodOptions.map((option) => {
											const checked = field.value?.includes(option.value);
											return (
												<label
													key={option.value}
													className="flex items-start gap-3 rounded-lg border border-border/70 p-4 text-sm shadow-sm"
												>
													<Checkbox
														checked={checked}
														onCheckedChange={(value) =>
															field.onChange(
																toggleValue(
																	field.value ?? [],
																	option.value,
																	Boolean(value),
																),
															)
														}
														disabled={!canManage || isSubmitting}
													/>
													<div>
														<p className="font-medium text-foreground">
															{option.label}
														</p>
														<p className="text-xs text-muted-foreground">
															{option.description}
														</p>
													</div>
												</label>
											);
										})}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="allowed_interest_types"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Interest types</FormLabel>
									<div className="mt-2 grid gap-3 md:grid-cols-2">
										{interestTypeOptions.map((option) => {
											const checked = field.value?.includes(option.value);
											return (
												<label
													key={option.value}
													className="flex items-start gap-3 rounded-lg border border-border/70 p-4 text-sm shadow-sm"
												>
													<Checkbox
														checked={checked}
														onCheckedChange={(value) =>
															field.onChange(
																toggleValue(
																	field.value ?? [],
																	option.value,
																	Boolean(value),
																),
															)
														}
														disabled={!canManage || isSubmitting}
													/>
													<div>
														<p className="font-medium text-foreground">
															{option.label}
														</p>
														<p className="text-xs text-muted-foreground">
															{option.description}
														</p>
													</div>
												</label>
											);
										})}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="min_loan_term_months"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Minimum term (months)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={360}
												{...field}
												value={Number.isNaN(field.value) ? "" : field.value}
												onChange={(event) =>
													field.onChange(event.target.valueAsNumber)
												}
												disabled={!canManage || isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="max_loan_term_months"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Maximum term (months)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={360}
												{...field}
												value={Number.isNaN(field.value) ? "" : field.value}
												onChange={(event) =>
													field.onChange(event.target.valueAsNumber)
												}
												disabled={!canManage || isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4 rounded-lg border border-border/70 p-4 shadow-sm">
							<p className="text-sm font-semibold text-foreground">Rates</p>
							{selectedInterestTypes?.includes("FIXED") ? (
								<FormField
									control={form.control}
									name="fixed_interest_rate_annual_percent"
									render={({ field }) => (
										<FormItem className="max-w-xs">
											<FormLabel>Fixed annual rate (%)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min={0}
													{...field}
													value={field.value ?? ""}
													onChange={(event) =>
														field.onChange(
															Number.isNaN(event.target.valueAsNumber)
																? null
																: event.target.valueAsNumber,
														)
													}
													disabled={!canManage || isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : null}
							{selectedInterestTypes?.includes("VARIABLE") ? (
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="variable_base_rate_annual_percent"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Variable base rate (%)</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														min={0}
														{...field}
														value={field.value ?? ""}
														onChange={(event) =>
															field.onChange(
																Number.isNaN(event.target.valueAsNumber)
																	? null
																	: event.target.valueAsNumber,
															)
														}
														disabled
														readOnly
													/>
												</FormControl>
												<p className="text-xs text-muted-foreground">
													Fetched from Internal Revenue Service Applicable
													federal mid-term rates.
												</p>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="variable_margin_annual_percent"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Variable margin (%)</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														min={0}
														{...field}
														value={field.value ?? ""}
														onChange={(event) =>
															field.onChange(
																Number.isNaN(event.target.valueAsNumber)
																	? null
																	: event.target.valueAsNumber,
															)
														}
														disabled={!canManage || isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							) : null}
						</div>

						<div className="space-y-4 rounded-lg border border-border/70 p-4 shadow-sm">
							<FormField
								control={form.control}
								name="require_down_payment"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between">
										<div className="space-y-0.5">
											<FormLabel className="text-base">
												Require down payment
											</FormLabel>
											<div className="text-sm text-muted-foreground">
												Require employees to provide a down payment before loan
												funding.
											</div>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={(checked) => {
													const nextValue = Boolean(checked);
													field.onChange(nextValue);
													if (!nextValue) {
														form.setValue("down_payment_percent", null, {
															shouldDirty: true,
														});
													}
												}}
												disabled={!canManage || isSubmitting}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							{requireDownPayment ? (
								<FormField
									control={form.control}
									name="down_payment_percent"
									render={({ field }) => (
										<FormItem className="max-w-xs">
											<FormLabel>Down payment percent (%)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min={0}
													{...field}
													value={field.value ?? ""}
													onChange={(event) =>
														field.onChange(
															Number.isNaN(event.target.valueAsNumber)
																? null
																: event.target.valueAsNumber,
														)
													}
													disabled={!canManage || isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
