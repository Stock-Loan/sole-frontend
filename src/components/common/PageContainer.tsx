import { Box } from "@chakra-ui/react";
import { PageContainerProps } from "./types";

export function PageContainer({ children }: PageContainerProps) {
  return (
		<Box maxW="6xl" mx="auto" px={{ base: 4, md: 6 }} pb={{ base: 12, md: 20 }}>
			{children}
		</Box>
	);
}
