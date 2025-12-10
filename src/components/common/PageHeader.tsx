import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { PageHeaderProps } from "./types";

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" mb={6} direction={{ base: "column", md: "row" }} gap={3}>
      <Box>
        <Heading size="lg" color="gray.800">
          {title}
        </Heading>
        {subtitle ? (
          <Text color="gray.600" mt={1}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {actions ? <Box>{actions}</Box> : null}
    </Flex>
  );
}
