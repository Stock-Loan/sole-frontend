import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  isInvalid?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
}
