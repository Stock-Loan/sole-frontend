import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from "@chakra-ui/react";

import { FormFieldProps } from "./types";

export function FormField({ label, isInvalid, error, helperText, children }: FormFieldProps) {
  return (
    <FormControl isInvalid={isInvalid} mb={4}>
      <FormLabel>{label}</FormLabel>
      {children}
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
      {isInvalid && error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}
