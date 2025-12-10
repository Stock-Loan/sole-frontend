import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CheckCircleIcon, TimeIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";

import { PageContainer } from "@/components/common/PageContainer";
import { BrandHeader } from "@/components/layout/BrandHeader";
import { fetchHealth, statusKeys } from "../api/status.api";
import { SummaryCardProps, ServiceCardProps } from "../types";

function statusColor(status: string) {
  if (status === "ok") return "green";
  if (status === "degraded" || status === "unknown") return "yellow";
  return "red";
}

function SummaryCard({ label, value, tone = "gray" }: SummaryCardProps) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" shadow="xs">
      <Text fontSize="sm" color="gray.600" mb={2}>
        {label}
      </Text>
      <Badge colorScheme={tone} fontSize="md" px={3} py={1} borderRadius="md">
        {value.toUpperCase()}
      </Badge>
    </Box>
  );
}

function ServiceCard({ name, status, error }: ServiceCardProps) {
  const colorScheme = statusColor(status);
  return (
    <Flex
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="white"
      shadow="xs"
      align={{ base: "flex-start", sm: "center" }}
      gap={3}
      direction={{ base: "column", sm: "row" }}
    >
      <Tag colorScheme={colorScheme} size="md" borderRadius="full" fontWeight="semibold">
        {status.toUpperCase()}
      </Tag>
      <Stack spacing={1} flex="1">
        <Text fontWeight="semibold" color="gray.800">
          {name}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {error ?? "Operating normally"}
        </Text>
      </Stack>
    </Flex>
  );
}

export function StatusPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: statusKeys.all,
    queryFn: fetchHealth,
    refetchOnWindowFocus: false,
  });

  return (
    <Box >
      <BrandHeader />
      <PageContainer >
        <Stack spacing={8}>
          <VStack spacing={4} textAlign="center" align="center">
            <HStack
              spacing={3}
              px={4}
              py={2}
              bg="white"
              borderRadius="full"
              borderWidth="1px"
              borderColor="gray.100"
              shadow="sm"
            >
              <Icon
                as={data?.status === "ok" ? CheckCircleIcon : WarningTwoIcon}
                color={data ? `${statusColor(data.status)}.500` : "gray.400"}
                boxSize={6}
              />
              <Heading size="lg">SOLE Backend Status</Heading>
            </HStack>
            <Text color="gray.600" maxW="720px">
              Live view of API, database, and worker dependencies. Use the refresh button to run a
              fresh check on demand.
            </Text>
            <HStack spacing={3} flexWrap="wrap" justify="center">
              <Button onClick={() => refetch()} isLoading={isFetching} colorScheme="brand">
                Refresh now
              </Button>
              {data && (
                <Tag colorScheme="gray" variant="subtle" display="inline-flex" alignItems="center" gap={1}>
                  <Icon as={TimeIcon} />
                  {new Date(data.timestamp).toLocaleString()}
                </Tag>
              )}
            </HStack>
          </VStack>

          {isLoading ? (
            <Flex align="center" justify="center" py={10}>
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : isError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Unable to load status</AlertTitle>
                <AlertDescription>{(error as Error)?.message ?? "Unknown error"}</AlertDescription>
              </Box>
            </Alert>
          ) : data ? (
            <Stack spacing={8}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                <GridItem>
                  <SummaryCard label="Overall" value={data.status} tone={statusColor(data.status)} />
                </GridItem>
                <GridItem>
                  <SummaryCard label="Environment" value={data.environment} tone="blue" />
                </GridItem>
                <GridItem>
                  <SummaryCard
                    label="Services checked"
                    value={`${Object.keys(data.checks).length} active`}
                    tone="purple"
                  />
                </GridItem>
              </Grid>

              <Divider />

              <Stack spacing={4}>
                <Heading size="md">Service checks</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 3, md: 4 }}>
                  {Object.entries(data.checks).map(([name, info]) => (
                    <ServiceCard
                      key={name}
                      name={name}
                      status={info.status}
                      error={info.error}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </PageContainer>
    </Box>
  );
}
