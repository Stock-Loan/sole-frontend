import { useToast } from "@/components/ui/use-toast";
import { parseApiError } from "@/lib/api-error";

export function useApiErrorToast() {
	const { toast } = useToast();

	return (error: unknown, fallback?: string) => {
		const apiError = parseApiError(error);

		toast({
			variant: "destructive",
			title: "Something went wrong",
			description:
				apiError.message || fallback || "Unable to complete that action. Please try again.",
		});
	};
}
