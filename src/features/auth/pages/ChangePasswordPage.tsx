import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { routes } from "@/lib/routes";
import { apiClient } from "@/lib/apiClient";
import { nonEmptyString } from "@/lib/validation";
import { useAuth } from "../hooks/useAuth";
import { changePassword, getMe, loginLegacy } from "../api/auth.api";
import type { AuthUser, LoginResponse, TokenPair } from "../types";
import { z } from "zod";

const changePasswordSchema = z
	.object({
		current_password: nonEmptyString.min(8, "Current password required"),
		new_password: nonEmptyString.min(8, "New password must be at least 8 characters"),
		confirm_password: nonEmptyString.min(8, "Confirm your new password"),
	})
	.refine((vals) => vals.new_password === vals.confirm_password, {
		path: ["confirm_password"],
		message: "Passwords do not match",
	});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordPage() {
	const { setSession, tokens } = useAuth();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const navigate = useNavigate();
	const [loginEmail, setLoginEmail] = useState<string>("");

	useEffect(() => {
		if (typeof localStorage === "undefined") return;
		const pendingEmail = localStorage.getItem("sole.pending-login-email");
		if (pendingEmail) {
			setLoginEmail(pendingEmail);
		}
	}, []);

	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (values: ChangePasswordFormValues) => {
			let workingTokens: TokenPair | null = tokens;

			// If no session yet (first-login redirect), perform a quick login to get a bearer token.
			if (!workingTokens) {
				if (!loginEmail) {
					throw new Error("Please start from the login flow to change your password.");
				}
				const legacyResponse = await loginLegacy({
					email: loginEmail,
					password: values.current_password,
				});
				workingTokens =
					(legacyResponse as LoginResponse | undefined)?.tokens ??
					((legacyResponse as TokenPair | undefined) ?? null);
			}

			if (!workingTokens?.access_token) {
				throw new Error("Unable to obtain a session token. Please sign in again.");
			}

			const { data: updatedTokens } = await apiClient.post<TokenPair>(
				"/auth/change-password",
				{
					current_password: values.current_password,
					new_password: values.new_password,
				},
				{
					headers: {
						Authorization: `Bearer ${workingTokens.access_token}`,
					},
				}
			);

			const { data: user } = await apiClient.get<AuthUser>("/auth/me", {
				headers: {
					Authorization: `Bearer ${updatedTokens.access_token}`,
				},
			});

			return { tokens: updatedTokens, user };
		},
		onSuccess: ({ tokens, user }) => {
			setSession(tokens, user);
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem("sole.pending-login-email");
			}
			toast({
				title: "Password updated",
				description: "Your session has been refreshed.",
			});
			navigate(routes.overview);
		},
		onError: (error) => {
			apiErrorToast(error, "Unable to change password. Please check your current password.");
		},
	});

	const onSubmit = (values: ChangePasswordFormValues) => mutation.mutate(values);

	return (
		<>
			<PublicHeader />
			<PageContainer className="flex min-h-[75vh] flex-col items-center justify-center pt-10">
				<div className="w-full max-w-lg space-y-6 rounded-xl border bg-card p-8 shadow-sm">
					<div className="flex items-center gap-2">
						<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<ShieldCheck className="h-5 w-5" />
						</span>
						<div>
							<h1 className="text-xl font-semibold">Change password</h1>
							<p className="text-sm text-muted-foreground">Update your credentials to stay secure.</p>
						</div>
					</div>
					<Form {...form}>
						<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name="current_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Current password</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												autoComplete="current-password"
												placeholder="Enter your current password"
												disabled={mutation.isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="new_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New password</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												autoComplete="new-password"
												placeholder="Enter a new password"
												disabled={mutation.isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirm_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm new password</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												autoComplete="new-password"
												placeholder="Re-enter your new password"
												disabled={mutation.isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className="w-full" type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Updating..." : "Change password"}
							</Button>
						</form>
					</Form>
				</div>
			</PageContainer>
		</>
	);
}
