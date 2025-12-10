import { Button, Center, Stack, Text } from "@chakra-ui/react";
import { EmptyStateProps } from "./types";

export function EmptyState({ message, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Center py={10} px={4} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100">
      <Stack spacing={3} align="center">
        {icon}
        <Text color="gray.600" textAlign="center">
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Button onClick={onAction} colorScheme="brand">
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Center>
  );
}
