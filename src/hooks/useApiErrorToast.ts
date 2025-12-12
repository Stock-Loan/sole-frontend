import type { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";

export function useApiErrorToast() {
	const { toast } = useToast();

	return (error: unknown, fallback?: string) => {
		const axiosError = error as AxiosError<{ detail?: unknown; message?: unknown }>;

		const toMessage = (value: unknown): string | null => {
			if (typeof value === "string") return value;
			if (Array.isArray(value) && value.length > 0) {
				const first = value[0] as { msg?: unknown; message?: unknown };
				return toMessage(first?.msg ?? first?.message);
			}
			if (value && typeof value === "object") {
				if ("message" in (value as Record<string, unknown>)) {
					return toMessage((value as { message?: unknown }).message);
				}
				if ("msg" in (value as Record<string, unknown>)) {
					return toMessage((value as { msg?: unknown }).msg);
				}
			}
			return null;
		};

		const detail =
			toMessage(axiosError?.response?.data?.detail) ||
			toMessage(axiosError?.response?.data?.message) ||
			toMessage(axiosError?.message) ||
			null;

		toast({
			variant: "destructive",
			title: "Something went wrong",
			description:
				detail || fallback || "Unable to complete that action. Please try again.",
		});
	};
}
