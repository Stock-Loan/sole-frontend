import type { FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "./FormField";
import type { DateFieldProps } from "./types";

export function DateField<TFieldValues extends FieldValues>({
	name,
	control,
	label,
	description,
	placeholder,
}: DateFieldProps<TFieldValues>) {
	return (
		<FormFieldWrapper
			name={name}
			control={control}
			label={label}
			description={description}
		>
			{({ field }) => (
				<Input type="date" placeholder={placeholder} {...field} />
			)}
		</FormFieldWrapper>
	);
}
