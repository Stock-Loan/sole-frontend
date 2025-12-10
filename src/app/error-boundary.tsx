import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export function RouteErrorBoundary() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";
  const message =
    (error as any)?.data?.message ||
    (error as Error)?.message ||
    "An unexpected error occurred. Please try again.";

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" px={6}>
      <Box bg="white" borderWidth="1px" borderColor="gray.100" borderRadius="xl" shadow="md" p={8} maxW="480px" w="full">
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {title}
          </Text>
          <Text color="gray.600">{message}</Text>
          <Button onClick={() => window.location.reload()} colorScheme="brand">
            Reload
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
