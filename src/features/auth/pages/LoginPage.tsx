import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft, CheckCircle2, Loader2, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { routes } from "@/lib/routes";
import { apiClient } from "@/lib/apiClient";
import { nonEmptyString } from "@/lib/validation";
import { useAuth } from "../hooks/useAuth";
import { completeLogin, startLogin } from "../api/auth.api";
import type { LoginCompletePayload, LoginStartPayload } from "../types";
import { z } from "zod";

const emailSchema = z.object({
	email: z.string().email("Enter a valid email").toLowerCase(),
});

const passwordSchema = z.object({
	password: nonEmptyString.min(8, "Password must be at least 8 characters"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const PENDING_EMAIL_KEY = "sole.pending-login-email";

export function LoginPage() {
	const navigate = useNavigate();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { setSession } = useAuth();

	const [step, setStep] = useState<"email" | "password">("email");
	const [challengeToken, setChallengeToken] = useState<string | null>(null);
	const [email, setEmail] = useState<string>("");

	const emailForm = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: "" },
	});

	const passwordForm = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { password: "" },
	});

	const startLoginMutation = useMutation({
		mutationFn: (payload: LoginStartPayload) => startLogin(payload),
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
	});

	const completeLoginMutation = useMutation({
		mutationFn: async (payload: LoginCompletePayload) => {
			const tokens = await completeLogin(payload);
			const { data: user } = await apiClient.get("/auth/me", {
				headers: {
					Authorization: `Bearer ${tokens.access_token}`,
				},
			});
			return { tokens, user };
		},
		onSuccess: ({ tokens, user }) => {
			setSession(tokens, user);
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(PENDING_EMAIL_KEY);
			}
			toast({
				title: "Welcome back",
				description: "You are now signed in.",
			});
			navigate(routes.overview);
		},
		onError: (error) => {
			if (
				isAxiosError(error) &&
				error.response?.status === 403 &&
				typeof error.response?.data?.detail === "string" &&
				error.response.data.detail.toLowerCase().includes("password change required")
			) {
				toast({
					title: "Password change required",
					description: "Please update your password to finish signing in.",
				});
				navigate(routes.changePassword, { replace: true });
				return;
			}
			apiErrorToast(error, "Invalid password or expired challenge. Please try again.");
		},
	});

	const handleEmailSubmit = (values: EmailFormValues) => {
		startLoginMutation.mutate({ email: values.email });
	};

	const handlePasswordSubmit = (values: PasswordFormValues) => {
		if (!challengeToken) {
			toast({
				variant: "destructive",
				title: "Start login first",
				description: "Verify your email before entering your password.",
			});
			setStep("email");
			return;
		}
		completeLoginMutation.mutate({ challenge_token: challengeToken, password: values.password });
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
		if (step === "password") return "Email verified. Enter your password to continue.";
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
						<CardTitle className="text-2xl font-semibold">Sign in to SOLE</CardTitle>
						<CardDescription className="text-sm">
							Step through email verification and password entry to access the console.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5 sm:px-8">
						<div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
							{statusMessage}
						</div>

						{step === "email" ? (
							<Form {...emailForm}>
								<form className="space-y-4" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
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
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button className="w-full" type="submit" disabled={startLoginMutation.isPending}>
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
								<form className="space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
									<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
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
													<Input
														{...field}
														type="password"
														autoComplete="current-password"
														placeholder="Enter your password"
														disabled={completeLoginMutation.isPending}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button className="w-full" type="submit" disabled={completeLoginMutation.isPending}>
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
