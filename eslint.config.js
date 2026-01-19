import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist"] },

	// 1. Base JS Config
	js.configs.recommended,

	// 2. TypeScript Config (Type-Aware)
	...tseslint.configs.recommendedTypeChecked,

	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				// FIXED: Point to the specific app config that "includes" your src folder
				// If you don't have these specific files, check your root folder for what tsconfig files exist.
				project: ["./tsconfig.app.json", "./tsconfig.node.json"],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		// 3. Manual Plugin Setup
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],

			// --- ADD THESE LINES TO DISABLE STRICT NOISE ---

			// 1. Allow using 'any' (sometimes you just need it)
			"@typescript-eslint/no-explicit-any": "off",

			// 2. Allow assigning data to variables even if types aren't perfect
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-floating-promises": "off",

			// 3. Allow passing async functions to things like onClick (common in React)
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false,
				},
			],
		},
	},
);
