import { Stack, Text } from "@chakra-ui/react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

export function LoanApplicationsPage() {
  return (
    <PageContainer>
      <Stack spacing={4}>
        <PageHeader title="Loan Applications" subtitle="Pipeline of employee loan applications." />
        <Stack borderWidth="1px" borderColor="gray.100" borderRadius="lg" bg="white" p={6} shadow="sm">
          <Text color="gray.600">Structure ready — add application lists, filters, and actions.</Text>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
