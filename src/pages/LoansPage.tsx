import { Stack, Text } from "@chakra-ui/react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

export function LoansPage() {
  return (
    <PageContainer>
      <Stack spacing={4}>
        <PageHeader title="Loans" subtitle="Portfolio of active and closed loans." />
        <Stack borderWidth="1px" borderColor="gray.100" borderRadius="lg" bg="white" p={6} shadow="sm">
          <Text color="gray.600">Structure ready — add loan tables, status, and actions.</Text>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
