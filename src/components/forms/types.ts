import type { FieldValues, Path, Control } from "react-hook-form";

export interface DateFieldProps<TFieldValues extends FieldValues> {
	name: Path<TFieldValues>;
	control: Control<TFieldValues>;
	label: string;
	description?: string;
	placeholder?: string;
}
export interface BaseFormFieldProps<TFieldValues extends FieldValues> {
	name: Path<TFieldValues>;
	control: Control<TFieldValues>;
	label: string;
	description?: string;
}
export interface RenderProps {
	field: Record<string, unknown>;
}
