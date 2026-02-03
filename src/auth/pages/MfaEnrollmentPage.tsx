import { ArrowLeft, Loader2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { PublicHeader } from "@/shared/ui/PublicHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { Button } from "@/shared/ui/Button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { OtpInput } from "@/auth/components/OtpInput";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import type { MfaEnrollmentPageProps } from "@/auth/types";

export function MfaEnrollmentPage({
	form,
	issuer,
	account,
	secret,
	otpauthUrl,
	showRememberDevice = true,
	isSubmitting,
	onSubmit,
	onReset,
	resetLabel = "Use a different email",
}: MfaEnrollmentPageProps) {
	return (
		<div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background">
			<PublicHeader />
			<div className="flex flex-1 justify-center overflow-y-auto md:items-center">
				<PageContainer className="w-full px-4 md:py-8 sm:px-6 md:w-[70%] md:px-0 lg:w-[70%] lg:py-12 xl:w-[60%] 2xl:w-[50%]">
					<div className="w-full space-y-6 sm:space-y-8">
						<div className="space-y-2 text-center">
							<h1 className="text-2xl font-semibold">
								Set up multi-factor authentication
							</h1>
							<p className="text-sm text-muted-foreground">
								Secure your account by adding an authenticator app.
							</p>
						</div>
						<div className="grid gap-6 sm:gap-8 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] md:items-start">
							<div className="order-2 space-y-4 sm:space-y-6 md:order-1">
								<div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
									Add{" "}
									<span className="font-semibold text-foreground">
										{issuer ?? "SOLE"}
									</span>{" "}
									to your authenticator app{account ? ` for ${account}.` : "."}
								</div>
								<div className="space-y-2">
									<Label>Setup key</Label>
									<p className="text-xs text-muted-foreground">
										Copy this key into your authenticator app, or scan the
										barcode.
									</p>
									<p className="rounded-md border bg-card px-3 py-2 font-mono text-sm">
										{secret ?? ""}
									</p>
								</div>
								<Form {...form}>
									<form
										className="space-y-4"
										onSubmit={form.handleSubmit(onSubmit)}
									>
										<FormField
											control={form.control}
											name="code"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Authentication code</FormLabel>
													<FormControl>
														<OtpInput
															value={field.value ?? ""}
															onChange={(next) =>
																form.setValue("code", next, {
																	shouldDirty: true,
																	shouldTouch: true,
																	shouldValidate: true,
																})
															}
															disabled={isSubmitting}
															autoFocus
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="flex items-center justify-between">
											{showRememberDevice ? (
												<FormField
													control={form.control}
													name="remember_device"
													render={({ field }) => (
														<FormItem className="flex items-center gap-2 space-y-0">
															<Checkbox
																checked={Boolean(field.value)}
																onCheckedChange={(checked) =>
																	form.setValue(
																		"remember_device",
																		Boolean(checked),
																		{
																			shouldDirty: true,
																			shouldTouch: true,
																		},
																	)
																}
																onClick={(event) => event.stopPropagation()}
																onPointerDown={(event) =>
																	event.stopPropagation()
																}
																aria-label="Remember this device"
															/>
															<span
																role="button"
																tabIndex={0}
																onClick={() =>
																	form.setValue(
																		"remember_device",
																		!field.value,
																		{
																			shouldDirty: true,
																			shouldTouch: true,
																		},
																	)
																}
																onKeyDown={(event) => {
																	if (
																		event.key === " " ||
																		event.key === "Enter"
																	) {
																		event.preventDefault();
																		form.setValue(
																			"remember_device",
																			!field.value,
																			{
																				shouldDirty: true,
																				shouldTouch: true,
																			},
																		);
																	}
																}}
																className="cursor-pointer text-sm font-normal"
															>
																Remember this device
															</span>
														</FormItem>
													)}
												/>
											) : null}
											<button
												type="button"
												onClick={onReset}
												className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
											>
												<ArrowLeft className="h-3 w-3" />
												{resetLabel}
											</button>
										</div>

										<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
											<Button
												className="w-full py-3.5 text-md mb-10 lg:mb-0 sm:w-auto flex-1"
												type="submit"
												disabled={isSubmitting}
											>
												{isSubmitting ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Confirming setup…
													</>
												) : (
													"Confirm setup"
												)}
											</Button>
										</div>
									</form>
								</Form>
							</div>
							<div className="order-1 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-6 md:order-2">
								<div className="space-y-3 text-center">
									<h2 className="text-sm font-semibold">Scan QR code</h2>
									{otpauthUrl ? (
										<div className="flex flex-col items-center gap-3">
											<QRCodeCanvas value={otpauthUrl} size={200} />
											<p className="text-xs text-muted-foreground">
												Scan this barcode with your authenticator app.
											</p>
										</div>
									) : (
										<p className="text-xs text-muted-foreground">
											QR code unavailable.
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</PageContainer>
			</div>
		</div>
	);
}
