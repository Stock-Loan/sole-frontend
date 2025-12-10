import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Center py={12} px={4} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100">
      <VStack spacing={3}>
        <Spinner color="brand.500" thickness="3px" size="lg" />
        <Text color="gray.600">{label}</Text>
      </VStack>
    </Center>
  );
}
