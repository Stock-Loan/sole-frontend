import { Box, Flex, HStack, Text, Link, Spacer } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { ShellProps } from "./types";

const navLinks = [
  { label: "Overview", to: "/app/overview" },
  { label: "Onboarding", to: "/app/onboarding/users" },
  { label: "Users", to: "/app/users" },
  { label: "Employees", to: "/app/employees" },
  { label: "Settings", to: "/app/settings" },
];

export function Shell({ children }: ShellProps) {
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Flex as="header" px={6} py={4} bg="white" shadow="sm" align="center">
        <Text fontWeight="bold" color="brand.600">
          SOLE
        </Text>
        <HStack spacing={4} ml={8} display={{ base: "none", md: "flex" }}>
          {navLinks.map((link) => (
            <Link key={link.to} as={RouterLink} to={link.to} fontWeight="medium" color="gray.600">
              {link.label}
            </Link>
          ))}
        </HStack>
        <Spacer />
        <Text fontSize="sm" color="gray.500">
          Org Switcher / User Menu
        </Text>
      </Flex>
      <Box as="main" flex="1" px={{ base: 4, md: 8 }} py={6}>
        {children}
      </Box>
    </Flex>
  );
}
