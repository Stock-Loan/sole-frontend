import {
	Avatar,
	Box,
	BoxProps,
	CloseButton,
	Divider,
	Drawer,
	DrawerContent,
	DrawerOverlay,
	Flex,
	FlexProps,
	Grid,
	GridItem,
	HStack,
	Icon,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Stack,
	Text,
	useDisclosure,
	VStack,
} from "@chakra-ui/react";
import {
	BellIcon,
	LockIcon,
	SearchIcon,
	TriangleDownIcon,
} from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
	FiLayers,
	FiSettings,
	FiUsers,
	FiGrid,
	FiFileText,
	FiMenu,
} from "react-icons/fi";
import { IconType } from "react-icons";

import { ShellProps } from "./types";
import { BrandBadge } from "@/components/common/BrandBadge";

interface LinkItemProps {
	label: string;
	to: string;
	icon: IconType | typeof LockIcon;
}

const sidebarLinks: LinkItemProps[] = [
	{ label: "Dashboard", to: "/app/dashboard", icon: FiGrid },
	{ label: "Loan Applications", to: "/app/loan-applications", icon: FiLayers },
	{ label: "Loans", to: "/app/loans", icon: FiFileText },
	{ label: "Organizations", to: "/app/organizations", icon: FiUsers },
	{
		label: "Platform Settings",
		to: "/app/platform-settings",
		icon: FiSettings,
	},
	{ label: "User Settings", to: "/app/user-settings", icon: LockIcon },
];

interface SidebarContentProps extends BoxProps {
	onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarContentProps) => {
	const location = useLocation();

	return (
		<Box
			bg="white"
			borderRightWidth="1px"
			borderColor="gray.100"
			w={{ base: "full", md: "16vw" }}
			pos="fixed"
			h="full"
			py={6}
			px={{ base: 4, md: 6 }}
			{...rest}
		>
			<Flex
				h="20"
				alignItems="center"
				mx="2"
				justifyContent="space-between"
				mb={6}
			>
				<BrandBadge />
				<CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
			</Flex>
			<Stack spacing={2}>
				{sidebarLinks.map((item) => {
					const active = location.pathname.startsWith(item.to);
					return (
						<Link
							key={item.to}
							as={RouterLink}
							to={item.to}
							onClick={onClose}
							display="flex"
							alignItems="center"
							gap={3}
							px={3}
							py={3}
							borderRadius="lg"
							fontWeight="medium"
							color={active ? "white" : "gray.700"}
							bg={active ? "brand.500" : "transparent"}
							_hover={{
								textDecoration: "none",
								bg: active ? "brand.600" : "gray.50",
							}}
							transition="all 0.2s"
						>
							<Icon as={item.icon} boxSize={5} />
							<Text fontSize="md">{item.label}</Text>
						</Link>
					);
				})}
			</Stack>
		</Box>
	);
};

export function Shell({ children }: ShellProps) {
	const location = useLocation();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const activeLink = sidebarLinks.find((s) =>
		location.pathname.startsWith(s.to)
	);

	return (
		<Box minH="100vh" bg="gray.50">
			{/* Desktop Sidebar */}
			<SidebarContent
				onClose={() => onClose}
				display={{ base: "none", md: "block" }}
			/>

			{/* Mobile Sidebar (Drawer) */}
			<Drawer
				autoFocus={false}
				isOpen={isOpen}
				placement="left"
				onClose={onClose}
				returnFocusOnClose={false}
				onOverlayClick={onClose}
				size="xs"
			>
				<DrawerOverlay />
				<DrawerContent>
					<SidebarContent onClose={onClose} />
				</DrawerContent>
			</Drawer>

			{/* Main Content Area */}
			<Box ml={{ base: 0, md: "16vw" }} transition=".3s ease">
				{/* Header */}
				<Box
					as="header"
					bg="white"
					px={{ base: 4, md: 8 }}
					py={4}
					borderBottomWidth="1px"
					borderColor="gray.100"
					position="sticky"
					top="0"
					zIndex="sticky"
				>
					<Grid
						templateColumns={{
							base: "auto 1fr auto",
							md: "200px 1fr 200px",
						}}
						gap={4}
						alignItems="center"
					>
						{/* Left: Mobile Menu & Title */}
						<Flex align="center" gap={3}>
							<IconButton
								display={{ base: "flex", md: "none" }}
								onClick={onOpen}
								variant="ghost"
								aria-label="open menu"
								icon={<FiMenu />}
								fontSize="24px"
							/>
							<Text
								display={{ base: "none", md: "block" }}
								fontSize="xl"
								fontWeight="bold"
								color="gray.900"
								whiteSpace="nowrap"
							>
								{activeLink?.label ?? "Dashboard"}
							</Text>
						</Flex>

						{/* Center: Search Bar */}
						<Flex justify="center" w="full">
							<InputGroup maxW="640px" w="full">
								<InputLeftElement pointerEvents="none" h="full" pl={2}>
									<SearchIcon color="brand.500" boxSize={5} />
								</InputLeftElement>
								<Input
									placeholder="Search..."
									bg="gray.50"
									borderColor="gray.100"
									height="48px"
									borderRadius="full"
									_focus={{
										borderColor: "brand.400",
										boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
									}}
								/>
							</InputGroup>
						</Flex>

						{/* Right: Actions */}
						<Flex justify="flex-end" align="center" gap={{ base: 2, md: 3 }}>
							<IconButton
								aria-label="Notifications"
								icon={<BellIcon boxSize={6} />}
								variant="ghost"
								colorScheme="gray"
								fontSize="22px"
								borderRadius="full"
							/>
							<Divider
								orientation="vertical"
								height="24px"
								display={{ base: "none", md: "block" }}
							/>
							<Menu>
								<MenuButton
									py={2}
									transition="all 0.3s"
									_focus={{ boxShadow: "none" }}
								>
									<HStack spacing={3}>
										<Avatar size="sm" name="Alex Doe" borderRadius="md" />
										<VStack
											display={{ base: "none", lg: "flex" }}
											alignItems="flex-start"
											spacing="1px"
											ml="2"
										>
											<Text fontSize="sm" fontWeight="semibold">
												Alex Doe
											</Text>
											<Text fontSize="xs" color="gray.600">
												Admin
											</Text>
										</VStack>
										<Box display={{ base: "none", lg: "flex" }}>
											<TriangleDownIcon color="gray.400" boxSize={3} />
										</Box>
									</HStack>
								</MenuButton>
								<MenuList>
									<MenuItem>Profile</MenuItem>
									<MenuItem>Settings</MenuItem>
									<MenuItem>Sign out</MenuItem>
								</MenuList>
							</Menu>
						</Flex>
					</Grid>
				</Box>

				{/* Page Content */}
				<Box p={{ base: 4, md: 8 }}>{children}</Box>
			</Box>
		</Box>
	);
}
