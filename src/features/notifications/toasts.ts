import type { Toast } from "@/shared/ui/use-toast";

export const notificationToasts = {
	markedRead(): Toast {
		return { title: "Marked as read" };
	},
	markReadError(): Toast {
		return { title: "Unable to mark read", variant: "destructive" };
	},
};
