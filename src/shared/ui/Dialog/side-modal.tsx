import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { SideModalProps } from "./types";

export function SideModal({
	open,
	onOpenChange,
	title,
	description,
	trigger,
	children,
	actions = [],
	onCancel,
}: SideModalProps) {
	const handleCancel = () => {
		onCancel?.();
		onOpenChange(false);
	};

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			{trigger ? (
				<DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
			) : null}
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content
					className={cn(
						"fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
					)}
				>
					<div className="flex items-start justify-between border-b px-6 py-4">
						<div className="space-y-1">
							<DialogPrimitive.Title className="text-lg font-semibold">
								{title}
							</DialogPrimitive.Title>
							<DialogPrimitive.Description
								className={cn(
									"text-sm text-muted-foreground",
									!description && "sr-only"
								)}
							>
								{description || title}
							</DialogPrimitive.Description>
						</div>
						<DialogPrimitive.Close asChild>
							<button
								type="button"
								className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
								aria-label="Close"
							></button>
						</DialogPrimitive.Close>
					</div>
					<div className="flex-1 overflow-auto px-6 py-4">{children}</div>
					<div className="flex flex-col gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						{actions.map((action) => (
							<Button
								key={action.label}
								variant={action.variant ?? "default"}
								type={action.type ?? "button"}
								form={action.form}
								onClick={action.onClick}
								disabled={action.disabled || action.loading}
							>
								{action.loading ? (
									<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-middle" />
								) : null}
								{action.label}
							</Button>
						))}
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export type { SideModalAction, SideModalProps } from "./types";
