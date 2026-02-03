import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MfaEnrollmentPage } from "@/auth/pages/MfaEnrollmentPage";
import { RecoveryCodesDisplay } from "@/auth/components/RecoveryCodesDisplay";
import { mfaCodeSchema } from "@/auth/schemas";
import { useAuth, useMfaSetupStart, useMfaSetupVerify } from "@/auth/hooks";
import { getMeWithToken } from "@/auth/api";
import { storeRememberDeviceToken } from "@/auth/hooks";
import { useTenant } from "@/features/tenancy/hooks";
import { routes } from "@/shared/lib/routes";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import type { LoginMfaFormValues } from "@/auth/types";

export function MfaSetupPage() {
	const { tokens, setSessionForOrg } = useAuth();
	const { currentOrgId } = useTenant();
	const navigate = useNavigate();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const [step, setStep] = useState<"setup" | "recovery-codes">("setup");
	const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
	const [setupData, setSetupData] = useState<{
		secret?: string;
		issuer?: string;
		account?: string;
		otpauth_url?: string;
		remember_device_days?: number | null;
	} | null>(null);

	const form = useForm<LoginMfaFormValues>({
		resolver: zodResolver(mfaCodeSchema),
		defaultValues: { code: "", remember_device: false },
	});

	const setupStart = useMfaSetupStart();
	const setupVerify = useMfaSetupVerify();

	useEffect(() => {
		if (!tokens?.access_token || setupData || setupStart.isPending) return;
		setupStart.mutate(undefined, {
			onSuccess: (data) => {
				setSetupData(data);
				form.reset({ code: "", remember_device: false });
			},
			onError: (error) =>
				apiErrorToast(error, "Unable to start MFA setup."),
		});
	}, [tokens?.access_token, setupData, setupStart, form, apiErrorToast]);

	const rememberDeviceAllowed = useMemo(
		() => Boolean(setupData?.remember_device_days),
		[setupData?.remember_device_days],
	);

	const handleSubmit = (values: LoginMfaFormValues) => {
		if (!currentOrgId) {
			toast({
				variant: "destructive",
				title: "Missing org",
				description: "Select an organization to continue.",
			});
			return;
		}
		setupVerify.mutate(
			{
				code: values.code,
				remember_device:
					rememberDeviceAllowed && Boolean(values.remember_device),
			},
			{
				onSuccess: async (response) => {
					const nextTokens = {
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
							nextTokens.access_token,
							currentOrgId,
						);
						setSessionForOrg(currentOrgId, nextTokens, user);
					} catch (error) {
						apiErrorToast(error, "Unable to refresh your session.");
					}
					if (response.recovery_codes?.length) {
						setRecoveryCodes(response.recovery_codes);
						setStep("recovery-codes");
						return;
					}
					navigate(routes.workspaceSettings, {
						replace: true,
						state: { tab: "security" },
					});
				},
				onError: (error) =>
					apiErrorToast(error, "Invalid MFA code. Please try again."),
			},
		);
	};

	if (step === "recovery-codes") {
		return (
			<RecoveryCodesDisplay
				recoveryCodes={recoveryCodes}
				onContinue={() =>
					navigate(routes.workspaceSettings, {
						replace: true,
						state: { tab: "security" },
					})
				}
				isLoggedIn
			/>
		);
	}

	return (
		<MfaEnrollmentPage
			form={form}
			issuer={setupData?.issuer}
			account={setupData?.account}
			secret={setupData?.secret}
			otpauthUrl={setupData?.otpauth_url}
			isSubmitting={setupVerify.isPending}
			onSubmit={handleSubmit}
			onReset={() =>
				navigate(routes.workspaceSettings, {
					replace: true,
					state: { tab: "security" },
				})
			}
			showRememberDevice={rememberDeviceAllowed}
			resetLabel="Back to settings"
		/>
	);
}
