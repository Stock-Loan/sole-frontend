import type { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";

export function useApiErrorToast() {
	const { toast } = useToast();

	return (error: unknown, fallback?: string) => {
		const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
		const detail =
			axiosError?.response?.data?.detail ||
			axiosError?.response?.data?.message ||
			axiosError?.message;

		toast({
			variant: "destructive",
			title: "Something went wrong",
			description: detail || fallback || "Unable to complete that action. Please try again.",
		});
	};
}
