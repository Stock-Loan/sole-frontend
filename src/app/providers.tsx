import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { TenantProvider } from "@/features/organizations/context/TenantProvider";
import { queryClient } from "@/lib/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TenantProvider>
					{children}
					<Toaster />
				</TenantProvider>
			</AuthProvider>
			{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
		</QueryClientProvider>
	);
}
