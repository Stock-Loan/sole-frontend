import { Heading, Stack, Text } from "@chakra-ui/react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

export function DashboardPage() {
  return (
    <PageContainer>
      <Stack spacing={4}>
        <PageHeader title="Dashboard" subtitle="Overview of your stock-loan program." />
        <Stack
          borderWidth="1px"
          borderColor="gray.100"
          borderRadius="lg"
          bg="white"
          p={6}
          shadow="sm"
        >
          <Heading size="md">Layout in progress</Heading>
          <Text color="gray.600">
            We will add cards, charts, and KPIs here following the provided design.
          </Text>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
