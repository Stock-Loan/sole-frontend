# SOLE Frontend

Employee Stock Loan web app frontend built with React, TypeScript, Vite, TailwindCSS, and shadcn/ui.

## Stack

- React + TypeScript + Vite
- TailwindCSS + shadcn/ui (Radix)
- React Router v6 (data routers)
- TanStack Query
- React Hook Form + Zod
- Axios (shared client)
- Yarn (package manager)

## Getting started

1) Install dependencies:

```bash
yarn install
```

2) Start dev server:

```bash
yarn dev
```

3) Build for production:

```bash
yarn build
```

4) Lint:

```bash
yarn lint
```

## Environment

Create a `.env` file (or use `.env.example`) with:

```
VITE_API_BASE_URL=...
```

## Tenancy (Org Context)

- Login is org-scoped. Users select an organization after email verification when multiple orgs are available.
- The app sets `X-Org-Id` on all API calls via the shared Axios client once a tenant is resolved.
- Switching orgs updates the active tenant context and refreshes the session for that org.
- Profile edits update org-scoped profile fields; membership data (employee ID, status) is managed separately per org.

## Project structure

```
src/
  app/          # bootstrapping, router, shell, navigation, permissions
  auth/         # public auth flows
  areas/        # route-level pages grouped by top-nav area
  entities/     # domain types, API, hooks, components
  features/     # cross-area features (notifications, search, tenancy, system)
  shared/       # UI kit, api client, hooks, utilities, assets
```

Key entry points:
- `src/app/bootstrap/main.tsx` (Vite entry)
- `src/app/App.tsx` (RouterProvider)
- `src/app/router/routes.tsx` (route composition)

## Routing model

- Public/auth routes live under `/auth/*` and system pages (status, errors) live outside the shell.
- Post-login areas are mounted under `/app/<area>/*`.
- Area navigation is defined in `src/app/navigation/nav-config.ts`.
- Guards live in `src/app/router/route-guards.tsx` and use permissions/tenancy state.

## Data access conventions

- API calls live in `entities/*/api.ts` or `features/*/api.ts`.
- UI uses entity/feature hooks (React Query is hidden behind hooks).
- Query keys are centralized in per-entity `keys.ts` modules.

## Styling

Global styles are in `src/app/styles/globals.css`. Tailwind config lives in `tailwind.config.ts`.
