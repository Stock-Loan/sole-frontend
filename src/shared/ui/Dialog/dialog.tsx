import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { AppDialogProps, DialogContentProps, DialogSize } from "./types";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogSizeClasses: Record<DialogSize, string> = {
	sm: "max-w-md",
	md: "max-w-2xl",
	lg: "max-w-3xl",
};

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	DialogContentProps
>(({ className, children, size = "lg", ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				"fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90vh]",
				dialogSizeClasses[size],
				className
			)}
			{...props}
		>
			{children}
		</DialogPrimitive.Content>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"sticky top-0 z-10 flex flex-col gap-1 border-b bg-background/95 px-6 py-3 text-center backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:text-left",
			className
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-muted/30 sm:flex-row sm:items-center sm:justify-end",
			className
		)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";


const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			"text-lg font-semibold leading-none tracking-tight",
			className
		)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex-1 overflow-auto px-6 py-4", className)}
		{...props}
	/>
));
DialogBody.displayName = "DialogBody";

const AppDialog = ({
	open,
	onOpenChange,
	title,
	description,
	children,
	trigger,
	onCancel,
	actions = [],
}: AppDialogProps) => {
	const handleCancel = () => {
		onCancel?.();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description ? (
						<DialogDescription>{description}</DialogDescription>
					) : (
						<DialogDescription className="sr-only">{title}</DialogDescription>
					)}
				</DialogHeader>
				<DialogBody>{children}</DialogBody>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					{actions.map((action) => (
						<Button
							key={action.label}
							variant={action.variant ?? "default"}
							onClick={action.onClick}
							type={action.type ?? "button"}
							form={action.form}
							disabled={action.disabled || action.loading}
						>
							{action.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							{action.label}
						</Button>
					))}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
AppDialog.displayName = "AppDialog";

export {
	Dialog,
	DialogContent,
	DialogBody,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	AppDialog,
};
export type { AppDialogProps };
export type { DialogAction, DialogContentProps, DialogSize } from "./types";
