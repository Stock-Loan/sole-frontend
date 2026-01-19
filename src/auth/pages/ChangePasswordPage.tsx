import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/shared/ui/input";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { routes } from "@/shared/lib/routes";
import { useAuth, useChangePasswordWithToken } from "@/auth/hooks";
import { changePasswordSchema } from "@/auth/schemas";
import type { ChangePasswordFormValues } from "@/auth/types";

export function ChangePasswordPage() {
	const { tokens, logout } = useAuth();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const navigate = useNavigate();
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Allow reaching this page on first-login 403 redirect even without a cached token.
	useEffect(() => {
		if (!tokens?.access_token) {
			// stay on page; user will come from 403 redirect
			return;
		}
	}, [tokens]);

	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const changePasswordMutation = useChangePasswordWithToken();

	const handleLogout = async () => {
		await logout();
		navigate(routes.login, { replace: true });
	};

	const onSubmit = (values: ChangePasswordFormValues) => {
		changePasswordMutation.mutate(
			{
				payload: {
					current_password: values.current_password,
					new_password: values.new_password,
				},
				accessToken: tokens?.access_token,
			},
			{
				onSuccess: async () => {
					await logout();
					toast({
						title: "Password updated successfully",
						description: "Please sign in with your new password.",
					});
					navigate(routes.login, { replace: true });
				},
				onError: (error) => {
					apiErrorToast(
						error,
						"Unable to change password. Please check your current password."
					);
				},
			}
		);
	};

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
							<p className="text-sm text-muted-foreground">
								Update your credentials to stay secure.
							</p>
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
											<div className="relative">
												<Input
													{...field}
													type={
														showCurrentPassword ? "text" : "password"
													}
													autoComplete="current-password"
													placeholder="Enter your current password"
													disabled={changePasswordMutation.isPending}
													className="pr-11"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
													onClick={() =>
														setShowCurrentPassword((prev) => !prev)
													}
													aria-label={
														showCurrentPassword
															? "Hide password"
															: "Show password"
													}
													disabled={changePasswordMutation.isPending}
												>
													{showCurrentPassword ? (
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
							<FormField
								control={form.control}
								name="new_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													type={showNewPassword ? "text" : "password"}
													autoComplete="new-password"
													placeholder="Enter a new password"
													disabled={changePasswordMutation.isPending}
													className="pr-11"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
													onClick={() =>
														setShowNewPassword((prev) => !prev)
													}
													aria-label={
														showNewPassword
															? "Hide password"
															: "Show password"
													}
													disabled={changePasswordMutation.isPending}
												>
													{showNewPassword ? (
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
							<FormField
								control={form.control}
								name="confirm_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm new password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													type={
														showConfirmPassword ? "text" : "password"
													}
													autoComplete="new-password"
													placeholder="Re-enter your new password"
													disabled={changePasswordMutation.isPending}
													className="pr-11"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
													onClick={() =>
														setShowConfirmPassword((prev) => !prev)
													}
													aria-label={
														showConfirmPassword
															? "Hide password"
															: "Show password"
													}
													disabled={changePasswordMutation.isPending}
												>
													{showConfirmPassword ? (
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
							<div className="flex gap-2">
								<Button
									className="w-full h-10"
									type="submit"
									disabled={changePasswordMutation.isPending}
								>
									{changePasswordMutation.isPending
										? "Updating..."
										: "Change password"}
								</Button>
								<Button
									variant="outline"
									className="w-full h-10"
									type="button"
									onClick={() => void handleLogout()}
									disabled={changePasswordMutation.isPending}
								>
									Log out
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</PageContainer>
		</>
	);
}
