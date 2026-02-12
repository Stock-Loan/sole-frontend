import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { ArrowLeft, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
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
	useLogin,
	useSelectOrg,
	useMfaVerify,
	useMfaEnrollStart,
	useMfaEnrollVerify,
} from "@/auth/hooks";
import { getAuthOrgs, getMeWithToken } from "@/auth/api";
import { credentialsSchema, mfaCodeSchema } from "@/auth/schemas";
import { PENDING_EMAIL_KEY, PENDING_ORG_SWITCH_KEY } from "@/auth/constants";
import type {
	AuthOrgSummary,
	AuthUser,
	LoginCredentialsFormValues,
	LoginMfaFormValues,
	TokenPair,
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
import { MfaEnrollmentPage } from "@/auth/pages/MfaEnrollmentPage";
import { OtpInput } from "@/auth/components/OtpInput";
import { RecoveryCodesDisplay } from "@/auth/components/RecoveryCodesDisplay";
import { parseOtpAuthUrl } from "@/auth/otpauth";

function buildTokensFromResponse(response: {
	access_token?: string;
	refresh_token?: string;
	csrf_token?: string | null;
}): TokenPair | null {
	if (!response.access_token) return null;
	const tokens: TokenPair = {
		access_token: response.access_token,
		token_type: "bearer",
	};
	if (response.csrf_token !== undefined) {
		tokens.csrf_token = response.csrf_token;
	}
	return tokens;
}

function isPasswordChangeRequiredError(error: unknown): boolean {
	if (!isAxiosError(error)) return false;
	if (error.response?.status !== 403) return false;

	const requestUrl = error.config?.url ?? "";
	if (requestUrl.includes("/auth/me")) {
		return true;
	}

	const data = error.response.data as
		| {
				code?: string;
				message?: string;
				detail?: string;
				details?: { detail?: string; message?: string };
		  }
		| undefined;

	const candidates = [
		data?.code,
		data?.message,
		data?.detail,
		data?.details?.detail,
		data?.details?.message,
	]
		.filter((value): value is string => typeof value === "string")
		.map((value) => value.toLowerCase());

	return candidates.some(
		(value) =>
			value.includes("password change required") ||
			value.includes("password_change_required") ||
			value.includes("must_change_password"),
	);
}

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
		| "credentials"
		| "org-select"
		| "mfa"
		| "mfa-setup"
		| "mfa-recovery"
		| "recovery-codes"
	>("credentials");
	const [showPassword, setShowPassword] = useState(false);
	const [preOrgToken, setPreOrgToken] = useState<string | null>(null);
	const [email, setEmail] = useState<string>("");
	const [availableOrgs, setAvailableOrgs] = useState<AuthOrgSummary[]>([]);
	const [challengeToken, setChallengeToken] = useState<string | null>(null);
	const [setupToken, setSetupToken] = useState<string | null>(null);
	const [mfaOtpAuthUrl, setMfaOtpAuthUrl] = useState<string | null>(null);
	const [rememberDeviceDays, setRememberDeviceDays] = useState<number | null>(
		null,
	);
	const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
	const [pendingLoginData, setPendingLoginData] = useState<{
		tokens: TokenPair;
	} | null>(null);
	const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);

	const credentialsForm = useForm<LoginCredentialsFormValues>({
		resolver: zodResolver(credentialsSchema),
		defaultValues: { email: "", password: "" },
	});

	const mfaForm = useForm<LoginMfaFormValues>({
		resolver: zodResolver(mfaCodeSchema),
		defaultValues: { code: "", remember_device: false },
	});

	const [recoveryCodeInput, setRecoveryCodeInput] = useState("");

	const loginMutation = useLogin();
	const selectOrgMutation = useSelectOrg();
	const mfaVerifyMutation = useMfaVerify();
	const mfaEnrollStartMutation = useMfaEnrollStart();
	const mfaEnrollVerifyMutation = useMfaEnrollVerify();

	const handlePasswordChangeRequired = useCallback(
		(tokens: TokenPair) => {
			if (!currentOrgId) return;
			const placeholderUser: AuthUser = {
				id: "pending",
				email: email,
				is_active: true,
				must_change_password: true,
			};
			setSessionForOrg(currentOrgId, tokens, placeholderUser);
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(PENDING_EMAIL_KEY);
				localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
			}
			toast({
				title: "Password change required",
				description: "Please update your password to finish signing in.",
			});
			navigate(routes.changePassword, { replace: true });
		},
		[currentOrgId, email, navigate, setSessionForOrg, toast],
	);

	const completeLogin = useCallback(
		async (tokens: TokenPair, orgId: string) => {
			try {
				const user = await getMeWithToken(tokens.access_token, orgId);
				if (user.must_change_password) {
					handlePasswordChangeRequired(tokens);
					return;
				}
				setSessionForOrg(orgId, tokens, user);
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
				if (isPasswordChangeRequiredError(error)) {
					handlePasswordChangeRequired(tokens);
					return;
				}
				apiErrorToast(error, "Unable to load your profile.");
			}
		},
		[
			apiErrorToast,
			handlePasswordChangeRequired,
			location.state,
			navigate,
			setSessionForOrg,
			toast,
		],
	);

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

	const handleSelectOrg = useCallback(
		(orgId: string, token: string) => {
			setCurrentOrgId(orgId);
			const rememberDeviceToken = loadRememberDeviceToken(orgId);
			selectOrgMutation.mutate(
				{
					payload: {
						org_id: orgId,
						remember_device_token: rememberDeviceToken,
					},
					preOrgToken: token,
				},
				{
					onSuccess: async (response) => {
						setRememberDeviceDays(response.remember_device_days ?? null);
						if (response.remember_device_days === 0 && rememberDeviceToken) {
							storeRememberDeviceToken(orgId, null);
						}

						if (response.mfa_setup_required) {
							if (!response.setup_token) {
								toast({
									variant: "destructive",
									title: "MFA setup failed",
									description: "Missing setup token. Please try again.",
								});
								return;
							}
							setSetupToken(response.setup_token);
							setStep("mfa-setup");
							mfaEnrollStartMutation.mutate(
								{
									payload: { setup_token: response.setup_token },
									preOrgToken: token,
								},
								{
									onSuccess: (setupData) => {
										setMfaOtpAuthUrl(setupData.otpauth_url);
										setRememberDeviceDays(
											setupData.remember_device_days ?? null,
										);
										mfaForm.reset({ code: "", remember_device: false });
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
							if (rememberDeviceToken) {
								storeRememberDeviceToken(orgId, null);
							}
							if (!response.challenge_token) {
								toast({
									variant: "destructive",
									title: "MFA required",
									description: "Missing challenge token. Please try again.",
								});
								return;
							}
							setChallengeToken(response.challenge_token);
							setStep("mfa");
							mfaForm.reset({ code: "", remember_device: false });
							return;
						}

						const tokens = buildTokensFromResponse(response);
						if (!tokens) {
							toast({
								variant: "destructive",
								title: "Login failed",
								description: "Missing access token.",
							});
							return;
						}
						await completeLogin(tokens, orgId);
					},
					onError: (error) => {
						apiErrorToast(
							error,
							"Unable to select organization. Please try again.",
						);
					},
				},
			);
		},
		[
			apiErrorToast,
			completeLogin,
			mfaEnrollStartMutation,
			mfaForm,
			selectOrgMutation,
			setCurrentOrgId,
			toast,
		],
	);

	const handleCredentialsSubmit = (values: LoginCredentialsFormValues) => {
		setEmail(values.email);
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(PENDING_EMAIL_KEY, values.email);
		}
		loginMutation.mutate(
			{ email: values.email, password: values.password },
			{
				onSuccess: async (response) => {
					const token = response.pre_org_token;
					setPreOrgToken(token);

					setIsLoadingOrgs(true);
					try {
						const orgsResponse = await getAuthOrgs(token);
						const orgs = orgsResponse.orgs;
						setIsLoadingOrgs(false);

						if (!orgs.length) {
							toast({
								variant: "destructive",
								title: "No organization found",
								description: "No active organizations found for this account.",
							});
							return;
						}

						setAvailableOrgs(orgs);
						const mappedOrgs = orgs.map((org) => ({
							id: org.org_id,
							name: org.name,
							slug: org.slug ?? undefined,
						}));
						setOrgs(mappedOrgs);

						const pendingOrgId =
							typeof localStorage !== "undefined"
								? localStorage.getItem(PENDING_ORG_SWITCH_KEY)
								: null;
						const matchingPendingOrg = pendingOrgId
							? orgs.find((org) => org.org_id === pendingOrgId)
							: null;

						if (orgs.length === 1 || orgsResponse.auto_selected) {
							const orgId = orgs[0].org_id;
							setCurrentOrgId(orgId);
							handleSelectOrg(orgId, token);
							return;
						}

						if (matchingPendingOrg) {
							setCurrentOrgId(matchingPendingOrg.org_id);
							handleSelectOrg(matchingPendingOrg.org_id, token);
							return;
						}

						setCurrentOrgId(orgs[0].org_id);
						setStep("org-select");
					} catch (error) {
						setIsLoadingOrgs(false);
						apiErrorToast(error, "Unable to load organizations.");
					}
				},
				onError: (error) => {
					apiErrorToast(error, "Invalid email or password. Please try again.");
				},
			},
		);
	};

	const handleOrgSubmit = () => {
		if (!currentOrgId || !preOrgToken) {
			toast({
				variant: "destructive",
				title: "Select an organization",
				description: "Choose an organization to continue.",
			});
			return;
		}
		handleSelectOrg(currentOrgId, preOrgToken);
	};

	const handleMfaSubmit = (values: LoginMfaFormValues) => {
		if (!preOrgToken || !challengeToken) {
			toast({
				variant: "destructive",
				title: "Session expired",
				description: "Please sign in again.",
			});
			resetFlow();
			return;
		}
		mfaVerifyMutation.mutate(
			{
				payload: {
					challenge_token: challengeToken,
					code: values.code,
					code_type: "totp",
					remember_device:
						rememberDeviceAllowed && Boolean(values.remember_device),
				},
				preOrgToken,
			},
			{
				onSuccess: async (response) => {
					const tokens = buildTokensFromResponse(response);
					if (!tokens) {
						toast({
							variant: "destructive",
							title: "Login failed",
							description: "Missing access token.",
						});
						return;
					}
					if (response.remember_device_token && currentOrgId) {
						storeRememberDeviceToken(
							currentOrgId,
							response.remember_device_token,
						);
					}
					if (currentOrgId) {
						await completeLogin(tokens, currentOrgId);
					}
				},
				onError: (error) => {
					apiErrorToast(error, "Invalid MFA code. Please try again.");
				},
			},
		);
	};

	const handleRecoveryCodeSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!preOrgToken || !challengeToken || !recoveryCodeInput.trim()) {
			toast({
				variant: "destructive",
				title: "Recovery code required",
				description: "Please enter your recovery code.",
			});
			return;
		}
		mfaVerifyMutation.mutate(
			{
				payload: {
					challenge_token: challengeToken,
					code: recoveryCodeInput.trim().toUpperCase(),
					code_type: "recovery",
				},
				preOrgToken,
			},
			{
				onSuccess: async (response) => {
					const tokens = buildTokensFromResponse(response);
					if (!tokens) {
						toast({
							variant: "destructive",
							title: "Login failed",
							description: "Missing access token.",
						});
						return;
					}
					if (currentOrgId) {
						await completeLogin(tokens, currentOrgId);
						toast({
							title: "Welcome back",
							description:
								"Signed in with recovery code. Consider regenerating your recovery codes.",
						});
					}
				},
				onError: (error) => {
					apiErrorToast(error, "Invalid recovery code. Please try again.");
				},
			},
		);
	};

	const handleMfaSetupSubmit = (values: LoginMfaFormValues) => {
		if (!preOrgToken || !setupToken) {
			toast({
				variant: "destructive",
				title: "Session expired",
				description: "Please sign in again.",
			});
			resetFlow();
			return;
		}
		mfaEnrollVerifyMutation.mutate(
			{
				payload: {
					setup_token: setupToken,
					code: values.code,
					remember_device:
						rememberDeviceAllowed && Boolean(values.remember_device),
				},
				preOrgToken,
			},
			{
				onSuccess: async (response) => {
					const tokens = buildTokensFromResponse(response);
					if (!tokens || !currentOrgId) {
						toast({
							variant: "destructive",
							title: "Login failed",
							description: "Missing access token.",
						});
						return;
					}
					if (response.remember_device_token) {
						storeRememberDeviceToken(
							currentOrgId,
							response.remember_device_token,
						);
					}
					if (response.recovery_codes && response.recovery_codes.length > 0) {
						setRecoveryCodes(response.recovery_codes);
						setPendingLoginData({ tokens });
						setStep("recovery-codes");
						return;
					}
					try {
						const user = await getMeWithToken(
							tokens.access_token,
							currentOrgId,
						);

						if (user.must_change_password) {
							handlePasswordChangeRequired(tokens);
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
						if (isPasswordChangeRequiredError(error)) {
							handlePasswordChangeRequired(tokens);
							return;
						}
						apiErrorToast(error, "Unable to load your profile.");
					}
				},
				onError: (error) => {
					apiErrorToast(error, "Invalid MFA code. Please try again.");
				},
			},
		);
	};

	const resetFlow = () => {
		setStep("credentials");
		setPreOrgToken(null);
		setChallengeToken(null);
		setSetupToken(null);
		setMfaOtpAuthUrl(null);
		setRememberDeviceDays(null);
		setRecoveryCodes([]);
		setPendingLoginData(null);
		setRecoveryCodeInput("");
		setAvailableOrgs([]);
		setOrgs([]);
		setCurrentOrgId(null);
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem(PENDING_EMAIL_KEY);
			localStorage.removeItem(PENDING_ORG_SWITCH_KEY);
		}
		credentialsForm.reset();
		mfaForm.reset({ code: "", remember_device: false });
	};

	const handleRecoveryCodesContinue = async () => {
		if (!pendingLoginData || !currentOrgId) {
			resetFlow();
			return;
		}
		const { tokens } = pendingLoginData;

		try {
			const user = await getMeWithToken(tokens.access_token, currentOrgId);
			if (user.must_change_password) {
				handlePasswordChangeRequired(tokens);
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
			if (isPasswordChangeRequiredError(error)) {
				handlePasswordChangeRequired(tokens);
				return;
			}
			apiErrorToast(error, "Unable to load your profile.");
		}
	};

	const rememberDeviceAllowed = (rememberDeviceDays ?? 1) > 0;
	const parsedMfaOtpAuth = useMemo(
		() => parseOtpAuthUrl(mfaOtpAuthUrl),
		[mfaOtpAuthUrl],
	);

	const statusMessage = useMemo(() => {
		if (loginMutation.isPending || isLoadingOrgs) return "Signing you in...";
		if (selectOrgMutation.isPending) return "Connecting to organization...";
		if (mfaVerifyMutation.isPending) return "Verifying MFA code...";
		if (mfaEnrollStartMutation.isPending) return "Preparing MFA setup...";
		if (mfaEnrollVerifyMutation.isPending) return "Confirming MFA setup...";
		if (step === "org-select") return "Select your organization to continue.";
		if (step === "mfa-recovery")
			return "Enter one of your backup recovery codes.";
		if (step === "mfa")
			return "Multi-factor authentication is required for this account.";
		if (step === "mfa-setup")
			return "Set up your authenticator app to continue.";
		return "Enter your email and password to sign in.";
	}, [
		step,
		loginMutation.isPending,
		isLoadingOrgs,
		selectOrgMutation.isPending,
		mfaVerifyMutation.isPending,
		mfaEnrollStartMutation.isPending,
		mfaEnrollVerifyMutation.isPending,
	]);

	const stepLabel = useMemo(() => {
		if (step === "credentials") return "Step 1 of 2";
		if (step === "org-select") return "Step 2 of 2";
		if (step === "mfa" || step === "mfa-setup" || step === "mfa-recovery")
			return "Verification";
		return "";
	}, [step]);

	let stepContent: ReactNode = null;
	if (step === "credentials") {
		stepContent = (
			<Form {...credentialsForm}>
				<form
					className="space-y-4"
					onSubmit={credentialsForm.handleSubmit(handleCredentialsSubmit)}
				>
					<FormField
						control={credentialsForm.control}
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
										disabled={loginMutation.isPending || isLoadingOrgs}
										className="h-13"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={credentialsForm.control}
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
											disabled={loginMutation.isPending || isLoadingOrgs}
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
											disabled={loginMutation.isPending || isLoadingOrgs}
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
						disabled={loginMutation.isPending || isLoadingOrgs}
					>
						{loginMutation.isPending || isLoadingOrgs ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</Button>
				</form>
			</Form>
		);
	} else if (step === "org-select") {
		stepContent = (
			<div className="space-y-4">
				<div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
					Multiple organizations found for{" "}
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
								<SelectItem key={org.org_id} value={org.org_id}>
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
					disabled={selectOrgMutation.isPending || !currentOrgId}
				>
					{selectOrgMutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Connecting...
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
					Use a different account
				</button>
			</div>
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
									<OtpInput
										value={field.value ?? ""}
										onChange={(next) =>
											mfaForm.setValue("code", next, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											})
										}
										disabled={mfaVerifyMutation.isPending}
										autoFocus
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
											mfaForm.setValue("remember_device", !field.value, {
												shouldDirty: true,
												shouldTouch: true,
											})
										}
										onKeyDown={(event) => {
											if (event.key === " " || event.key === "Enter") {
												event.preventDefault();
												mfaForm.setValue("remember_device", !field.value, {
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
					<Button
						className="w-full py-3.5 text-md"
						type="submit"
						disabled={mfaVerifyMutation.isPending}
					>
						{mfaVerifyMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Verifying code...
							</>
						) : (
							"Verify"
						)}
					</Button>
					<div className="flex flex-col items-center gap-2">
						<button
							type="button"
							onClick={() => setStep("mfa-recovery")}
							className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
						>
							Use a recovery code instead
						</button>
						<button
							type="button"
							onClick={resetFlow}
							className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
						>
							<ArrowLeft className="h-3 w-3" />
							Use a different account
						</button>
					</div>
				</form>
			</Form>
		);
	}

	if (step === "mfa-recovery") {
		stepContent = (
			<form className="space-y-4" onSubmit={handleRecoveryCodeSubmit}>
				<div className="space-y-2">
					<Label htmlFor="recovery-code">Recovery code</Label>
					<Input
						id="recovery-code"
						type="text"
						value={recoveryCodeInput}
						onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
						placeholder="XXXX-XXXX"
						autoComplete="off"
						disabled={mfaVerifyMutation.isPending}
						className="h-13 font-mono text-center tracking-widest"
					/>
					<p className="text-xs text-muted-foreground">
						Enter one of the recovery codes you saved when setting up MFA.
					</p>
				</div>
				<Button
					className="w-full py-3.5 text-md"
					type="submit"
					disabled={mfaVerifyMutation.isPending || !recoveryCodeInput.trim()}
				>
					{mfaVerifyMutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						</>
					) : (
						"Verify recovery code"
					)}
				</Button>
				<div className="flex flex-col items-center gap-2">
					<button
						type="button"
						onClick={() => {
							setRecoveryCodeInput("");
							setStep("mfa");
						}}
						className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
					>
						Use authenticator app instead
					</button>
					<button
						type="button"
						onClick={resetFlow}
						className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
					>
						<ArrowLeft className="h-3 w-3" />
						Use a different account
					</button>
				</div>
			</form>
		);
	}

	if (step === "mfa-setup") {
		return (
			<MfaEnrollmentPage
				form={mfaForm}
				issuer={parsedMfaOtpAuth.issuer}
				account={parsedMfaOtpAuth.account}
				secret={parsedMfaOtpAuth.secret}
				otpauthUrl={mfaOtpAuthUrl}
				isSubmitting={mfaEnrollVerifyMutation.isPending}
				onSubmit={handleMfaSetupSubmit}
				onReset={resetFlow}
				showRememberDevice={rememberDeviceAllowed}
			/>
		);
	}

	if (step === "recovery-codes") {
		return (
			<RecoveryCodesDisplay
				recoveryCodes={recoveryCodes}
				onContinue={handleRecoveryCodesContinue}
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
							Enter your credentials to access your workspace.
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
