import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { BrandHeader } from "@/components/layout/BrandHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleEnter = () => {
    navigate(isAuthenticated ? "/app" : "/login");
  };

  return (
    <Box bgGradient="linear(to-b, gray.50, white)" minH="100vh">
      <BrandHeader />
      <Container maxW="5xl" py={{ base: 8, md: 12 }}>
        <Stack spacing={10} align="center" textAlign="center">
          <Stack spacing={3}>
            <Heading size="2xl" lineHeight="short">
              Welcome to Sole Platform
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall" maxW="3xl">
              This portal is for members of the organization to access and manage their stock loan
              workflows. If you're a member, you should have received sign-in credentials from the
              platform team or your manager. If your welcome email hasn't arrived, please contact your
              manager or the platform team before attempting to sign in.
            </Text>
          </Stack>

          <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
            <Button size="lg" colorScheme="brand" onClick={handleEnter}>
              Enter Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/status")}>
              View Site Status
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
