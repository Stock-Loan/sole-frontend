import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#e8f3ff",
    100: "#c8dfff",
    200: "#a6cbff",
    300: "#84b6ff",
    400: "#62a2ff",
    500: "#4888e6",
    600: "#386ab4",
    700: "#284c82",
    800: "#182e51",
    900: "#081121",
  },
};

const fonts = {
  heading: "'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
};

export const theme = extendTheme({ config, colors, fonts });
