import type { ReactNode } from "react";
import type { FieldValues } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { BaseFormFieldProps, RenderProps } from "./types";

export function FormFieldWrapper<TFieldValues extends FieldValues>({
	name,
	control,
	label,
	description,
	children,
}: BaseFormFieldProps<TFieldValues> & {
	children: (props: RenderProps) => ReactNode;
}) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>{children({ field })}</FormControl>
					{description ? (
						<p className="text-xs text-muted-foreground">{description}</p>
					) : null}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
