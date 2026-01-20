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
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
import {
	loadRememberDeviceToken,
	storeRememberDeviceToken,
	useAuth,
	useCompleteLogin,
	useLoginMfa,
	useLoginMfaSetupStart,
	useLoginMfaSetupVerify,
	useOrgDiscovery,
	useStartLogin,
} from "@/auth/hooks";
import { getMeWithToken } from "@/auth/api";
import { emailSchema, mfaCodeSchema, passwordSchema } from "@/auth/schemas";
import type {
	AuthUser,
	LoginEmailFormValues,
	LoginMfaFormValues,
	LoginPasswordFormValues,
} from "@/auth/types";
import { useTenantOptional } from "@/features/tenancy/hooks";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import type { OrgSummary } from "@/entities/org/types";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { MfaEnrollmentPage } from "@/auth/components/MfaEnrollmentPage";

const PENDING_EMAIL_KEY = "sole.pending-login-email";
const PENDING_ORG_SWITCH_KEY = "sole.pending-org-switch";
export const REMEMBER_DEVICE_KEY = "sole.mfa.remember-device";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { setSessionForOrg } = useAuth();
	const tenant = useTenantOptional();
	const [, setLocalOrgs] = useState<OrgSummary[]>([]);
	const [localOrgId, setLocalOrgId] = useState<string | null>(null);
	const setOrgs = tenant?.setOrgs ?? setLocalOrgs;
	const currentOrgId = tenant?.currentOrgId ?? localOrgId;
	const setCurrentOrgId = tenant?.setCurrentOrgId ?? setLocalOrgId;
	const pendingOrgToastShownRef = useRef(false);

	const [step, setStep] = useState<
		"email" | "org" | "password" | "mfa" | "mfa-setup"
	>("email");
	const [challengeToken, setChallengeToken] = useState<string | null>(null);
	const [email, setEmail] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);
	const [availableOrgs, setAvailableOrgs] = useState<OrgSummary[]>([]);
	const [mfaToken, setMfaToken] = useState<string | null>(null);
	const [setupToken, setSetupToken] = useState<string | null>(null);
	const [mfaSecret, setMfaSecret] = useState<string | null>(null);
	const [mfaIssuer, setMfaIssuer] = useState<string | null>(null);
	const [mfaAccount, setMfaAccount] = useState<string | null>(null);
	const [mfaOtpAuthUrl, setMfaOtpAuthUrl] = useState<string | null>(null);
	const [rememberDeviceDays, setRememberDeviceDays] = useState<number | null>(
		null,
	);

	const emailForm = useForm<LoginEmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: "" },
	});

	const passwordForm = useForm<LoginPasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { password: "" },
	});

	const mfaForm = useForm<LoginMfaFormValues>({
		resolver: zodResolver(mfaCodeSchema),
		defaultValues: { code: "", remember_device: false },
	});

	const startLoginMutation = useStartLogin();
	const completeLoginMutation = useCompleteLogin();
	const loginMfaMutation = useLoginMfa();
	const loginMfaSetupStartMutation = useLoginMfaSetupStart();
	const loginMfaSetupVerifyMutation = useLoginMfaSetupVerify();
	const orgDiscoveryMutation = useOrgDiscovery();

	useEffect(() => {
		if (pendingOrgToastShownRef.current) return;
		const pendingOrgId =
			typeof localStorage !== "undefined"
				? localStorage.getItem(PENDING_ORG_SWITCH_KEY)
				: null;
		if (!pendingOrgId) return;
		pendingOrgToastShownRef.current = true;
		toast({
			variant: "destructive",
			title: "Sign in required",
			description: "Sign in to the requested organization to continue.",
		});
	}, [toast]);

	const startLoginForOrg = (emailAddress: string, orgId: string) => {
		startLoginMutation.mutate(
			{ payload: { email: emailAddress }, orgId },
			{
				onSuccess: (data, variables) => {
					setChallengeToken(data.challenge_token);
					setEmail(variables.payload.email);
					if (typeof localStorage !== "undefined") {
						localStorage.setItem(PENDING_EMAIL_KEY, variables.payload.email);
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

	const handleEmailSubmit = (values: LoginEmailFormValues) => {
		orgDiscoveryMutation.mutate(
			{ email: values.email },
			{
				onSuccess: (orgs) => {
					if (!orgs.length) {
						toast({
							variant: "destructive",
							title: "No organization found",
							description: "We couldn't find an organization for that email.",
						});
						return;
					}
					setEmail(values.email);
					setAvailableOrgs(orgs);
					setOrgs(orgs);
					const defaultOrgId = orgs[0]?.id ?? null;
					const pendingOrgId =
						typeof localStorage !== "undefined"
							? localStorage.getItem(PENDING_ORG_SWITCH_KEY)
							: null;
					const resolvedOrgId =
						pendingOrgId && orgs.some((org) => org.id === pendingOrgId)
							? pendingOrgId
							: defaultOrgId;
					setCurrentOrgId(resolvedOrgId);

					if (orgs.length === 1 && resolvedOrgId) {
						startLoginForOrg(values.email, resolvedOrgId);
						return;
					}

					setStep("org");
				},
				onError: (error) => {
					apiErrorToast(
						error,
						"Unable to find an organization for that email.",
					);
				},
			},
		);
	};

	const handleOrgSubmit = () => {
		if (!currentOrgId) {
			toast({
				variant: "destructive",
				title: "Select an organization",
				description: "Choose an organization to continue.",
			});
			return;
		}
		startLoginForOrg(email, currentOrgId);
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
		if (!currentOrgId) {
			toast({
				variant: "destructive",
				title: "Select an organization",
				description: "Choose an organization to continue signing in.",
			});
			setStep("org");
			return;
		}
		const rememberDeviceToken = loadRememberDeviceToken(currentOrgId);
		completeLoginMutation.mutate(
			{
				payload: {
					challenge_token: challengeToken,
					password: values.password,
					remember_device_token: rememberDeviceToken,
				},
				orgId: currentOrgId,
			},
			{
				onSuccess: async (response) => {
					setRememberDeviceDays(response.remember_device_days ?? null);
					if (response.mfa_setup_required) {
						const setup = response.setup_token;
						if (!setup) {
							toast({
								variant: "destructive",
								title: "MFA setup failed",
								description: "Missing setup token. Please try again.",
							});
							return;
						}
						if (response.access_token && response.refresh_token) {
							try {
								const user = await getMeWithToken(
									response.access_token,
									currentOrgId,
								);
								if (user.must_change_password) {
									const tokens = {
										access_token: response.access_token,
										refresh_token: response.refresh_token,
										token_type: "bearer" as const,
									};
									setSessionForOrg(currentOrgId, tokens, user);
									if (typeof localStorage !== "undefined") {
										localStorage.removeItem(PENDING_EMAIL_KEY);
										localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
									}
									toast({
										title: "Password change required",
										description:
											"Please update your password to finish signing in.",
									});
									navigate(routes.changePassword, { replace: true });
									return;
								}
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
										data?.details?.detail ||
										data?.detail ||
										data?.message ||
										"";

									if (
										detail.toLowerCase().includes("password change required")
									) {
										const placeholderUser: AuthUser = {
											id: "pending",
											email: email,
											is_active: true,
										};
										const tokens = {
											access_token: response.access_token,
											refresh_token: response.refresh_token,
											token_type: "bearer" as const,
										};
										setSessionForOrg(currentOrgId, tokens, placeholderUser);
										if (typeof localStorage !== "undefined") {
											localStorage.removeItem(PENDING_EMAIL_KEY);
											localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
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
							}
						}
						setSetupToken(setup);
						setStep("mfa-setup");
						loginMfaSetupStartMutation.mutate(
							{ payload: { setup_token: setup }, orgId: currentOrgId },
							{
								onSuccess: (setupData) => {
									setMfaSecret(setupData.secret);
									setMfaIssuer(setupData.issuer);
									setMfaAccount(setupData.account);
									setMfaOtpAuthUrl(setupData.otpauth_url);
									setRememberDeviceDays(setupData.remember_device_days ?? null);
									mfaForm.reset({ code: "", remember_device: false });
									toast({
										title: "Set up MFA",
										description:
											"Add the secret to your authenticator app and enter the code.",
									});
								},
								onError: (error) => {
									apiErrorToast(
										error,
										"Unable to start MFA setup. Please try again.",
									);
								},
							},
						);
						return;
					}
					if (response.mfa_required) {
						if (!response.mfa_token) {
							toast({
								variant: "destructive",
								title: "MFA required",
								description: "Missing MFA token. Please try again.",
							});
							return;
						}
						setMfaToken(response.mfa_token);
						setStep("mfa");
						mfaForm.reset({ code: "", remember_device: false });
						toast({
							title: "MFA required",
							description: "Enter the code from your authenticator app.",
						});
						return;
					}
					if (!response.access_token || !response.refresh_token) {
						toast({
							variant: "destructive",
							title: "Login failed",
							description: "Missing authentication tokens.",
						});
						return;
					}
					const tokens = {
						access_token: response.access_token,
						refresh_token: response.refresh_token,
						token_type: "bearer" as const,
					};
					try {
						const user = await getMeWithToken(
							tokens.access_token,
							currentOrgId,
						);
						if (user.must_change_password) {
							setSessionForOrg(currentOrgId, tokens, user);
							if (typeof localStorage !== "undefined") {
								localStorage.removeItem(PENDING_EMAIL_KEY);
								localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
							}
							toast({
								title: "Password change required",
								description:
									"Please update your password to finish signing in.",
							});
							navigate(routes.changePassword, { replace: true });
							return;
						}
						setSessionForOrg(currentOrgId, tokens, user);
						if (typeof localStorage !== "undefined") {
							localStorage.removeItem(PENDING_EMAIL_KEY);
							localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
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
								setSessionForOrg(currentOrgId, tokens, placeholderUser);
								if (typeof localStorage !== "undefined") {
									localStorage.removeItem(PENDING_EMAIL_KEY);
									localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
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

	const handleMfaSubmit = (values: LoginMfaFormValues) => {
		if (!currentOrgId || !mfaToken) {
			toast({
				variant: "destructive",
				title: "MFA required",
				description: "Restart the login flow to receive a new MFA prompt.",
			});
			setStep("password");
			return;
		}
		loginMfaMutation.mutate(
			{
				payload: {
					mfa_token: mfaToken,
					code: values.code,
					remember_device:
						rememberDeviceAllowed && Boolean(values.remember_device),
				},
				orgId: currentOrgId,
			},
			{
				onSuccess: async (response) => {
					const tokens = {
						access_token: response.access_token,
						refresh_token: response.refresh_token,
						token_type: "bearer" as const,
					};
					if (response.remember_device_token) {
						storeRememberDeviceToken(
							currentOrgId,
							response.remember_device_token,
						);
					}
					try {
						const user = await getMeWithToken(
							tokens.access_token,
							currentOrgId,
						);
						if (user.must_change_password) {
							setSessionForOrg(currentOrgId, tokens, user);
							if (typeof localStorage !== "undefined") {
								localStorage.removeItem(PENDING_EMAIL_KEY);
								localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
							}
							toast({
								title: "Password change required",
								description:
									"Please update your password to finish signing in.",
							});
							navigate(routes.changePassword, { replace: true });
							return;
						}
						setSessionForOrg(currentOrgId, tokens, user);
						if (typeof localStorage !== "undefined") {
							localStorage.removeItem(PENDING_EMAIL_KEY);
							localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
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
								setSessionForOrg(currentOrgId, tokens, placeholderUser);
								if (typeof localStorage !== "undefined") {
									localStorage.removeItem(PENDING_EMAIL_KEY);
									localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
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
					apiErrorToast(error, "Invalid MFA code. Please try again.");
				},
			},
		);
	};

	const handleMfaSetupSubmit = (values: LoginMfaFormValues) => {
		if (!currentOrgId || !setupToken) {
			toast({
				variant: "destructive",
				title: "MFA setup required",
				description: "Restart the login flow to set up MFA.",
			});
			setStep("password");
			return;
		}
		loginMfaSetupVerifyMutation.mutate(
			{
				payload: {
					setup_token: setupToken,
					code: values.code,
					remember_device:
						rememberDeviceAllowed && Boolean(values.remember_device),
				},
				orgId: currentOrgId,
			},
			{
				onSuccess: async (response) => {
					const tokens = {
						access_token: response.access_token,
						refresh_token: response.refresh_token,
						token_type: "bearer" as const,
					};
					if (response.remember_device_token) {
						storeRememberDeviceToken(
							currentOrgId,
							response.remember_device_token,
						);
					}
					try {
						const user = await getMeWithToken(
							tokens.access_token,
							currentOrgId,
						);
						if (user.must_change_password) {
							setSessionForOrg(currentOrgId, tokens, user);
							if (typeof localStorage !== "undefined") {
								localStorage.removeItem(PENDING_EMAIL_KEY);
								localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
							}
							toast({
								title: "Password change required",
								description:
									"Please update your password to finish signing in.",
							});
							navigate(routes.changePassword, { replace: true });
							return;
						}
						setSessionForOrg(currentOrgId, tokens, user);
						if (typeof localStorage !== "undefined") {
							localStorage.removeItem(PENDING_EMAIL_KEY);
							localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
						}
						toast({
							title: "MFA enabled",
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
								setSessionForOrg(currentOrgId, tokens, placeholderUser);
								if (typeof localStorage !== "undefined") {
									localStorage.removeItem(PENDING_EMAIL_KEY);
									localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
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
					apiErrorToast(error, "Invalid MFA code. Please try again.");
				},
			},
		);
	};

	const resetFlow = () => {
		setStep("email");
		setChallengeToken(null);
		setMfaToken(null);
		setSetupToken(null);
		setMfaSecret(null);
		setMfaIssuer(null);
		setMfaAccount(null);
		setMfaOtpAuthUrl(null);
		setRememberDeviceDays(null);
		setAvailableOrgs([]);
		setOrgs([]);
		setCurrentOrgId(null);
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem(PENDING_EMAIL_KEY);
			localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
		}
		passwordForm.reset();
		mfaForm.reset({ code: "", remember_device: false });
	};

	const rememberDeviceAllowed = (rememberDeviceDays ?? 1) > 0;

	const statusMessage = useMemo(() => {
		if (orgDiscoveryMutation.isPending) return "Finding your organization...";
		if (startLoginMutation.isPending) return "Verifying email...";
		if (completeLoginMutation.isPending) return "Signing you in...";
		if (loginMfaMutation.isPending) return "Verifying MFA code...";
		if (loginMfaSetupStartMutation.isPending) return "Preparing MFA setup...";
		if (loginMfaSetupVerifyMutation.isPending) return "Confirming MFA setup...";
		if (step === "org") return "Select your organization to continue.";
		if (step === "password")
			return "Email verified. Enter your password to continue.";
		if (step === "mfa")
			return "Multi-factor authentication is required for this account.";
		if (step === "mfa-setup")
			return "Set up your authenticator app to continue.";
		return "Enter your email to get started.";
	}, [
		step,
		orgDiscoveryMutation.isPending,
		startLoginMutation.isPending,
		completeLoginMutation.isPending,
		loginMfaMutation.isPending,
		loginMfaSetupStartMutation.isPending,
		loginMfaSetupVerifyMutation.isPending,
	]);

	const stepLabel = useMemo(() => {
		if (step === "email") return "Step 1 of 4";
		if (step === "org") return "Step 2 of 4";
		if (step === "password") return "Step 3 of 4";
		if (step === "mfa" || step === "mfa-setup") return "Step 4 of 4";
		return "";
	}, [step]);

	let stepContent: ReactNode = null;
	if (step === "email") {
		stepContent = (
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
										disabled={
											startLoginMutation.isPending ||
											orgDiscoveryMutation.isPending
										}
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
						disabled={
							startLoginMutation.isPending || orgDiscoveryMutation.isPending
						}
					>
						{orgDiscoveryMutation.isPending || startLoginMutation.isPending ? (
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
		);
	} else if (step === "org") {
		stepContent = (
			<div className="space-y-4">
				<div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
					We found multiple organizations for{" "}
					<span className="font-semibold text-foreground">{email}</span>. Select
					the one you want to access.
				</div>
				<div className="space-y-2">
					<Label>Organization</Label>
					<Select
						value={currentOrgId ?? undefined}
						onValueChange={(value) => setCurrentOrgId(value)}
					>
						<SelectTrigger className="h-12">
							<SelectValue placeholder="Select organization" />
						</SelectTrigger>
						<SelectContent>
							{availableOrgs.map((org) => (
								<SelectItem key={org.id} value={org.id}>
									{org.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Button
					className="w-full py-3.5 text-md"
					type="button"
					onClick={handleOrgSubmit}
					disabled={startLoginMutation.isPending || !currentOrgId}
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
				<button
					type="button"
					onClick={resetFlow}
					className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
				>
					<ArrowLeft className="h-3 w-3" />
					Use a different email
				</button>
			</div>
		);
	} else if (step === "password") {
		stepContent = (
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
							<span className="font-medium text-foreground">{email}</span>
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
											onClick={() => setShowPassword((prev) => !prev)}
											aria-label={
												showPassword ? "Hide password" : "Show password"
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
		);
	} else if (step === "mfa") {
		stepContent = (
			<Form {...mfaForm}>
				<form
					className="space-y-4"
					onSubmit={mfaForm.handleSubmit(handleMfaSubmit)}
				>
					<FormField
						control={mfaForm.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Authentication code</FormLabel>
								<FormControl>
									<Input
										{...field}
										autoComplete="one-time-code"
										placeholder="123456"
										disabled={loginMfaMutation.isPending}
										className="h-13"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{rememberDeviceAllowed ? (
						<FormField
							control={mfaForm.control}
							name="remember_device"
							render={({ field }) => (
								<FormItem className="flex items-center gap-2 space-y-0">
									<Checkbox
										checked={Boolean(field.value)}
										onCheckedChange={(checked) =>
											mfaForm.setValue("remember_device", Boolean(checked), {
												shouldDirty: true,
												shouldTouch: true,
											})
										}
										onClick={(event) => event.stopPropagation()}
										onPointerDown={(event) => event.stopPropagation()}
										aria-label="Remember this device"
									/>
									<span
										role="button"
										tabIndex={0}
										onClick={() =>
											mfaForm.setValue(
												"remember_device",
												!field.value,
												{
													shouldDirty: true,
													shouldTouch: true,
												}
											)
										}
										onKeyDown={(event) => {
											if (event.key === " " || event.key === "Enter") {
												event.preventDefault();
												mfaForm.setValue(
													"remember_device",
													!field.value,
													{
														shouldDirty: true,
														shouldTouch: true,
													}
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
					<Button
						className="w-full py-3.5 text-md"
						type="submit"
						disabled={loginMfaMutation.isPending}
					>
						{loginMfaMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Verifying code…
							</>
						) : (
							"Verify"
						)}
					</Button>
					<button
						type="button"
						onClick={resetFlow}
						className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
					>
						<ArrowLeft className="h-3 w-3" />
						Use a different email
					</button>
				</form>
			</Form>
		);
	}

	if (step === "mfa-setup") {
		return (
			<MfaEnrollmentPage
				form={mfaForm}
				issuer={mfaIssuer}
				account={mfaAccount}
				secret={mfaSecret}
				otpauthUrl={mfaOtpAuthUrl}
				isSubmitting={loginMfaSetupVerifyMutation.isPending}
				onSubmit={handleMfaSetupSubmit}
				onReset={resetFlow}
				showRememberDevice={rememberDeviceAllowed}
			/>
		);
	}

	return (
		<>
			<PublicHeader />
			<PageContainer className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-6">
				<Card className="flex w-full max-w-lg max-h-[calc(100vh-10rem)] flex-col overflow-hidden border border-border/60 bg-card/95 shadow-xl backdrop-blur sm:rounded-2xl">
					<CardHeader className="space-y-3 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Shield className="h-6 w-6" />
						</div>
						<CardTitle className="text-2xl font-semibold">
							Sign in to SOLE
						</CardTitle>
						<CardDescription className="text-sm">
							Continue with your email and complete multi-factor verification
							when required.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 space-y-6 sm:px-8 overflow-y-auto">
						{stepLabel ? (
							<div className="flex items-center justify-center">
								<span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
									{stepLabel}
								</span>
							</div>
						) : null}
						<div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
							{statusMessage}
						</div>

						{stepContent}

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
