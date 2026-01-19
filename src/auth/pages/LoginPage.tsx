import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
	ArrowLeft,
	CheckCircle2,
	Eye,
	EyeOff,
	Loader2,
	Shield,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
	Link,
	useLocation,
	useNavigate,
	type Location,
} from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PublicHeader } from "@/shared/ui/PublicHeader";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { routes } from "@/shared/lib/routes";
import { useAuth, useCompleteLogin, useStartLogin } from "@/auth/hooks";
import { getMeWithToken } from "@/auth/api";
import { emailSchema, passwordSchema } from "@/auth/schemas";
import type {
	AuthUser,
	LoginEmailFormValues,
	LoginPasswordFormValues,
} from "@/auth/types";

const PENDING_EMAIL_KEY = "sole.pending-login-email";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { setSession } = useAuth();

	const [step, setStep] = useState<"email" | "password">("email");
	const [challengeToken, setChallengeToken] = useState<string | null>(null);
	const [email, setEmail] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);

	const emailForm = useForm<LoginEmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: "" },
	});

	const passwordForm = useForm<LoginPasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { password: "" },
	});

	const startLoginMutation = useStartLogin();
	const completeLoginMutation = useCompleteLogin();

	const handleEmailSubmit = (values: LoginEmailFormValues) => {
		startLoginMutation.mutate(
			{ email: values.email },
			{
				onSuccess: (data, variables) => {
					setChallengeToken(data.challenge_token);
					setEmail(variables.email);
					if (typeof localStorage !== "undefined") {
						localStorage.setItem(PENDING_EMAIL_KEY, variables.email);
					}
					setStep("password");
					toast({
						title: "Email verified",
						description: "Enter your password to finish signing in.",
					});
				},
				onError: (error) => {
					apiErrorToast(error, "Unable to verify email. Please try again.");
				},
			},
		);
	};

	const handlePasswordSubmit = (values: LoginPasswordFormValues) => {
		if (!challengeToken) {
			toast({
				variant: "destructive",
				title: "Start login first",
				description: "Verify your email before entering your password.",
			});
			setStep("email");
			return;
		}
		completeLoginMutation.mutate(
			{ challenge_token: challengeToken, password: values.password },
			{
				onSuccess: async (tokens) => {
					try {
						const user = await getMeWithToken(tokens.access_token);
						if (user.must_change_password) {
							setSession(tokens, user);
							if (typeof localStorage !== "undefined") {
								localStorage.removeItem(PENDING_EMAIL_KEY);
							}
							toast({
								title: "Password change required",
								description:
									"Please update your password to finish signing in.",
							});
							navigate(routes.changePassword, { replace: true });
							return;
						}
						setSession(tokens, user);
						if (typeof localStorage !== "undefined") {
							localStorage.removeItem(PENDING_EMAIL_KEY);
						}
						toast({
							title: "Welcome back",
							description: "You are now signed in.",
						});
						const from = (location.state as { from?: Location })?.from;
						const destination = from?.pathname
							? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
							: routes.workspace;
						navigate(destination, { replace: true });
					} catch (error) {
						if (isAxiosError(error) && error.response?.status === 403) {
							const data = error.response.data as
								| {
										detail?: string;
										message?: string;
										details?: { detail?: string };
								  }
								| undefined;
							const detail =
								data?.details?.detail || data?.detail || data?.message || "";

							if (detail.toLowerCase().includes("password change required")) {
								const placeholderUser: AuthUser = {
									id: "pending",
									email: email,
									is_active: true,
								};
								setSession(tokens, placeholderUser);
								if (typeof localStorage !== "undefined") {
									localStorage.removeItem(PENDING_EMAIL_KEY);
								}
								toast({
									title: "Password change required",
									description:
										"Please update your password to finish signing in.",
								});
								navigate(routes.changePassword, { replace: true });
								return;
							}
						}
						throw error;
					}
				},
				onError: (error) => {
					apiErrorToast(
						error,
						"Invalid password or expired challenge. Please try again.",
					);
				},
			},
		);
	};

	const resetFlow = () => {
		setStep("email");
		setChallengeToken(null);
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem(PENDING_EMAIL_KEY);
		}
		passwordForm.reset();
	};

	const statusMessage = useMemo(() => {
		if (startLoginMutation.isPending) return "Verifying email...";
		if (completeLoginMutation.isPending) return "Signing you in...";
		if (step === "password")
			return "Email verified. Enter your password to continue.";
		return "Enter your email to get started.";
	}, [step, startLoginMutation.isPending, completeLoginMutation.isPending]);

	return (
		<>
			<PublicHeader />
			<PageContainer className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-8">
				<Card className="w-full max-w-lg border-none bg-transparent shadow-none sm:border sm:border-border/70 sm:bg-card sm:shadow-lg sm:rounded-2xl">
					<CardHeader className="space-y-3 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Shield className="h-6 w-6" />
						</div>
						<CardTitle className="text-2xl font-semibold">
							Sign in to SOLE
						</CardTitle>
						<CardDescription className="text-sm">
							Step through email verification and password entry to access the
							console.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5 sm:px-8">
						<div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
							{statusMessage}
						</div>

						{step === "email" ? (
							<Form {...emailForm}>
								<form
									className="space-y-4"
									onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
								>
									<FormField
										control={emailForm.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email address</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="email"
														autoComplete="email"
														placeholder="you@example.com"
														disabled={startLoginMutation.isPending}
														className="h-13"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										className="w-full py-3.5 text-md"
										type="submit"
										disabled={startLoginMutation.isPending}
									>
										{startLoginMutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Verifying email…
											</>
										) : (
											"Continue"
										)}
									</Button>
								</form>
							</Form>
						) : (
							<Form {...passwordForm}>
								<form
									className="space-y-4"
									onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
								>
									<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-2">
											<CheckCircle2
												className="h-4 w-4 text-emerald-600"
												aria-hidden="true"
											/>
											<span className="font-medium text-foreground">
												{email}
											</span>
										</div>
										<button
											type="button"
											onClick={resetFlow}
											className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
										>
											<ArrowLeft className="h-3 w-3" />
											Use a different email
										</button>
									</div>
									<FormField
										control={passwordForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															{...field}
															type={showPassword ? "text" : "password"}
															autoComplete="current-password"
															placeholder="Enter your password"
															disabled={completeLoginMutation.isPending}
															className="h-13 pr-11"
														/>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
															onClick={() =>
																setShowPassword((prev) => !prev)
															}
															aria-label={
																showPassword
																	? "Hide password"
																	: "Show password"
															}
															disabled={completeLoginMutation.isPending}
														>
															{showPassword ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										className="w-full py-3.5 text-md"
										type="submit"
										disabled={completeLoginMutation.isPending}
									>
										{completeLoginMutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Signing in…
											</>
										) : (
											"Sign in"
										)}
									</Button>
								</form>
							</Form>
						)}

						<p className="text-center text-xs text-muted-foreground">
							Need access? Contact your administrator or{" "}
							<Link className="text-primary underline" to={routes.status}>
								check platform status
							</Link>
							.
						</p>
					</CardContent>
				</Card>
			</PageContainer>
		</>
	);
}
