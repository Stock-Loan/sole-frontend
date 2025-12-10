# SOLE Frontend

React 19 + React Compiler + TypeScript + Vite + Chakra UI scaffold for the SOLE platform.

## Getting Started
- Install dependencies: `yarn`
- Run dev server: `yarn dev`
- Build: `yarn build`
- Preview build: `yarn preview`

## Environment
Copy `.env.example` to `.env` and set:
- `VITE_API_BASE_URL` (e.g., http://localhost:8000/api/v1)
- `VITE_TENANCY_MODE` (`single` or `multi`)
- `VITE_APP_NAME`

## Structure (key folders)
- `src/app` — app shell (main, router, providers, theme)
- `src/components` — layout/common/form helpers
- `src/features` — domain slices (auth, onboarding, employees, etc.)
- `src/lib` — apiClient, config, query client
- `src/pages` — top-level routed pages (e.g., welcome)

## Notes
- Axios is centralized in `src/lib/apiClient.ts` with auth and tenant header injection.
- ChakraProvider + React Query + Router are composed in `src/app/providers.tsx` and `src/app/main.tsx`.
- Routes are defined in `src/app/router.tsx` with protected sections and placeholders for major areas.
- Public status page lives at `/status` and reads from the backend `/health` endpoint.
