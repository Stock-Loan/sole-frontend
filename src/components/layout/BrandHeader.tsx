import { Box, Container } from "@chakra-ui/react";

import { BrandBadge } from "@/components/common/BrandBadge";

export function BrandHeader() {
	return (
		<Box as="header" pt={{ base: 2, md: 8 }} mb={{ base: 6, md: 10 }}>
			<Container maxW="6xl" p={{ base: 4, md: 6 }}>
				<BrandBadge />
			</Container>
		</Box>
	);
}
