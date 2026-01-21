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
}: MfaEnrollmentPageProps) {
	return (
		<>
			<PublicHeader />
			<PageContainer className="flex min-h-[75vh] flex-col items-center justify-center pt-10">
				<div className="w-full max-w-5xl space-y-8">
					<div className="space-y-2 text-center">
						<h1 className="text-2xl font-semibold">
							Set up multi-factor authentication
						</h1>
						<p className="text-sm text-muted-foreground">
							Secure your account by adding an authenticator app.
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
						<div className="space-y-6">
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
									Copy this key into your authenticator app, or scan the barcode
									on the right.
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
														onPointerDown={(event) => event.stopPropagation()}
														aria-label="Remember this device"
													/>
													<span
														role="button"
														tabIndex={0}
														onClick={() =>
															form.setValue("remember_device", !field.value, {
																shouldDirty: true,
																shouldTouch: true,
															})
														}
														onKeyDown={(event) => {
															if (event.key === " " || event.key === "Enter") {
																event.preventDefault();
																form.setValue("remember_device", !field.value, {
																	shouldDirty: true,
																	shouldTouch: true,
																});
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
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
										<Button
											className="w-full py-3.5 text-md"
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
										<button
											type="button"
											onClick={onReset}
											className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
										>
											<ArrowLeft className="h-3 w-3" />
											Use a different email
										</button>
									</div>
								</form>
							</Form>
						</div>
						<div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
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
		</>
	);
}
