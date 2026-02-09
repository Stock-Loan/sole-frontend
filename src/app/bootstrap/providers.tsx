import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/shared/ui/toaster";
import {
	AuthProvider,
	ImpersonationProvider,
	StepUpMfaProvider,
} from "@/auth/providers";
import { StepUpMfaModal } from "@/auth/components/StepUpMfaModal";
import { InactivityProvider } from "@/auth/inactivityProvider";
import { InactivityWarningBanner } from "@/auth/components/InactivityWarningBanner";
import { ImpersonationBanner } from "@/auth/components/ImpersonationBanner";
import { TenantProvider } from "@/features/tenancy/tenantStore";
import { queryClient } from "@/shared/api/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ImpersonationProvider>
					<TenantProvider>
						<InactivityProvider>
							<StepUpMfaProvider>
								{children}
								<ImpersonationBanner />
								<InactivityWarningBanner />
								<StepUpMfaModal />
								<Toaster />
							</StepUpMfaProvider>
						</InactivityProvider>
					</TenantProvider>
				</ImpersonationProvider>
			</AuthProvider>
			{import.meta.env.DEV ? (
				<ReactQueryDevtools initialIsOpen={false} />
			) : null}
		</QueryClientProvider>
	);
}
