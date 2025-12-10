import { Stack, Text } from "@chakra-ui/react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

export function OrganizationsPage() {
  return (
    <PageContainer>
      <Stack spacing={4}>
        <PageHeader title="Organizations" subtitle="Manage tenants, org profiles, and settings." />
        <Stack borderWidth="1px" borderColor="gray.100" borderRadius="lg" bg="white" p={6} shadow="sm">
          <Text color="gray.600">Structure ready — add org list, details, and controls.</Text>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
