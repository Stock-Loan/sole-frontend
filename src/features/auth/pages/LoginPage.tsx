import {
	Box,
	Button,
	Container,
	Divider,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Link,
	Stack,
	Text,
	useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BrandHeader } from "@/components/layout/BrandHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function LoginPage() {
	const { setToken } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as any)?.from?.pathname || "/app";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const cardBg = useColorModeValue("white", "gray.800");
	const cardBorder = useColorModeValue("gray.100", "gray.700");
	const muted = useColorModeValue("gray.600", "gray.400");

	const handleLogin = () => {
		// TODO: wire to API when available
		setToken("dev-token");
		navigate(from, { replace: true });
	};

	return (
		<Box minH="100vh" bgGradient="linear(to-b, gray.50, white)">
			<BrandHeader />
			<Container maxW="lg" pb={{ base: 12, md: 20 }} pt={{ base: 8, md: 0 }}>
				<Stack spacing={8}>
					<Stack spacing={3} align="center">
						<Heading size="xl">Sign in to your account</Heading>
						<Text color={muted}>
							Access the stock-loan console and continue your work.
						</Text>
					</Stack>

					<Box
						bg={{ base: "transparent", md: cardBg }}
						borderWidth={{ base: "0", md: "1px" }}
						borderColor={{ base: "transparent", md: cardBorder }}
						borderRadius={{ base: "none", md: "xl" }}
						shadow={{ base: "none", md: "lg" }}
						px={{ base: 0, md: 8 }}
						py={{ base: 0, md: 8 }}
					>
						<Stack spacing={6}>
							<FormControl>
								<FormLabel>Email</FormLabel>
								<Input
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									size="lg"
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Password</FormLabel>
								<Input
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									size="lg"
								/>
							</FormControl>
							<Button colorScheme="brand" size="lg" onClick={handleLogin}>
								Continue
							</Button>

							<Divider display={{ base: "none", md: "block" }} />

							<Text fontSize="sm" color={muted} textAlign="center">
								Trouble signing in? Contact your platform admin or{" "}
								<Link color="brand.600" href="mailto:platform@example.com">
									support
								</Link>
								.
							</Text>
						</Stack>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
}
