import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/shared/ui/toaster";
import { AuthProvider } from "@/auth/sessionStore";
import { StepUpMfaProvider } from "@/auth/stepUpMfaContext";
import { StepUpMfaModal } from "@/auth/components/StepUpMfaModal";
import { TenantProvider } from "@/features/tenancy/tenantStore";
import { queryClient } from "@/shared/api/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TenantProvider>
					<StepUpMfaProvider>
						{children}
						<StepUpMfaModal />
						<Toaster />
					</StepUpMfaProvider>
				</TenantProvider>
			</AuthProvider>
			{import.meta.env.DEV ? (
				<ReactQueryDevtools initialIsOpen={false} />
			) : null}
		</QueryClientProvider>
	);
}
