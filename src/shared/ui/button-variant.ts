import { cva } from "class-variance-authority";

export const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
				outline:
					"border border-primary/60 bg-background text-primary shadow-sm hover:border-primary hover:bg-primary/5 hover:text-primary",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "py-3 px-4 min-w-[80px]",
				sm: "rounded-md py-2.5 px-4 min-w-[80px]",
				lg: "rounded-md py-3 px-4 min-w-[80px]",
				icon: "h-11 w-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);
