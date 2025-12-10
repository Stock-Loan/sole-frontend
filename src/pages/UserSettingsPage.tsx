import { Stack, Text } from "@chakra-ui/react";

import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";

export function UserSettingsPage() {
  return (
    <PageContainer>
      <Stack spacing={4}>
        <PageHeader title="User Settings" subtitle="Manage your profile, security, and preferences." />
        <Stack borderWidth="1px" borderColor="gray.100" borderRadius="lg" bg="white" p={6} shadow="sm">
          <Text color="gray.600">Structure ready — add user preferences and security settings.</Text>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
