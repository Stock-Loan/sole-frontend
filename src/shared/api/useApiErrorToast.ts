import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";

const GENERIC_ERROR_MESSAGES = new Set([
	"request failed",
	"network error",
	"an unknown error occurred",
]);

function isGenericMessage(message: string | null | undefined): boolean {
	if (!message) return true;
	return GENERIC_ERROR_MESSAGES.has(message.trim().toLowerCase());
}

export function useApiErrorToast() {
	const { toast } = useToast();

	return (error: unknown, fallback?: string) => {
		const apiError = parseApiError(error);
		const description =
			!isGenericMessage(apiError.message)
				? apiError.message
				: fallback || apiError.message || "Unable to complete that action. Please try again.";

		toast({
			variant: "destructive",
			title: "Something went wrong",
			description,
		});
	};
}
