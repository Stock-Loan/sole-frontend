import { Box, Flex, Text } from "@chakra-ui/react";

export function BrandBadge() {
  return (
    <Flex
      align="center"
      gap={2}
      bg="white"
      px={4}
      py={2}
      borderRadius="full"
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
      w="fit-content"
      transform={{ base: "translate(-4px, -4px)", md: "translate(-12px, -8px)" }}
    >
      <Box
        bgGradient="linear(to-r, brand.500, brand.700)"
        color="white"
        fontWeight="bold"
        px={3}
        py={1}
        borderRadius="full"
        letterSpacing="wide"
      >
        SOLE
      </Box>
      <Text fontWeight="semibold" color="gray.700" noOfLines={1}>
        Stock Option Loan for Employees
      </Text>
    </Flex>
  );
}
