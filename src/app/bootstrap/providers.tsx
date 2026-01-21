import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/shared/ui/toaster";
import { AuthProvider, StepUpMfaProvider } from "@/auth/providers";
import { StepUpMfaModal } from "@/auth/components/StepUpMfaModal";
import { InactivityProvider } from "@/auth/inactivityProvider";
import { InactivityWarningBanner } from "@/auth/components/InactivityWarningBanner";
import { TenantProvider } from "@/features/tenancy/tenantStore";
import { queryClient } from "@/shared/api/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TenantProvider>
					<InactivityProvider>
						<StepUpMfaProvider>
							{children}
							<InactivityWarningBanner />
							<StepUpMfaModal />
							<Toaster />
						</StepUpMfaProvider>
					</InactivityProvider>
				</TenantProvider>
			</AuthProvider>
			{import.meta.env.DEV ? (
				<ReactQueryDevtools initialIsOpen={false} />
			) : null}
		</QueryClientProvider>
	);
}
