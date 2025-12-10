import { useToast } from "@chakra-ui/react";
import { AxiosError } from "axios";

export function useApiErrorToast() {
  const toast = useToast();

  return (error: unknown, title = "Request failed") => {
    let description = "";
    if (error && typeof error === "object" && "message" in error) {
      description = (error as { message?: string }).message ?? "";
    }
    if (error instanceof AxiosError) {
      description = error.response?.data?.detail ?? error.message;
    }
    toast({
      status: "error",
      title,
      description,
      duration: 5000,
      isClosable: true,
    });
  };
}
