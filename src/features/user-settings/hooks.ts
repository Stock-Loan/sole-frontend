import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { authKeys } from "@/auth/constants";
import {
	getUserSettings,
	updateSelfProfile,
	exportSelfData,
} from "./api/userSettings.api";
import type { UserSettingsProfile } from "./types";
import type { UpdateSelfProfilePayload } from "@/entities/user/types";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";

export function useUserSettings(
	options: Omit<
		UseQueryOptions<UserSettingsProfile>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: authKeys.selfProfile(),
		queryFn: getUserSettings,
		staleTime: 5 * 60 * 1000,
		...options,
	});
}

export function useUpdateSelfProfile() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: (payload: UpdateSelfProfilePayload) =>
			updateSelfProfile(payload),
		onSuccess: () => {
			toast({
				title: "Profile updated",
				description: "Your profile has been saved.",
			});
			queryClient.invalidateQueries({ queryKey: authKeys.selfProfile() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Profile update failed",
				description: apiError.message,
			});
		},
	});
}

export function useExportSelfData() {
	const { toast } = useToast();

	return useMutation({
		mutationFn: exportSelfData,
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "my_data_export.csv";
			link.click();
			URL.revokeObjectURL(url);
			toast({
				title: "Data exported",
				description: "Your personal data has been downloaded.",
			});
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Export failed",
				description: apiError.message,
			});
		},
	});
}
