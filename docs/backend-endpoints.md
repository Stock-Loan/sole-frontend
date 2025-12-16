# Backend Endpoint Documentation (FastAPI style)

## [GET] /api/v1/health/live

- Summary: Liveness probe; no dependencies checked.
- Auth: None
- Tenant: Not required.
- Success 200: Returns status and timestamp.
- Example response:

```json
{
	"status": "ok",
	"timestamp": "2025-01-01T00:00:00Z"
}
```

## [GET] /api/v1/health/ready

- Summary: Readiness probe; checks API, database, and Redis.
- Auth: None
- Tenant: Not required.
- Success 200: Returns overall status (`ok` or `degraded`), `ready` boolean, environment, timestamp, and per-service checks.
- Example response:

```json
{
	"status": "ok",
	"ready": true,
	"environment": "development",
	"timestamp": "2025-01-01T00:00:00Z",
	"checks": {
		"api": { "status": "ok", "version": "0.1.0" },
		"database": { "status": "ok" },
		"redis": { "status": "ok" }
	}
}
```

## [GET] /api/v1/health

- Summary: Backward-compatible readiness probe (same payload as `/health/ready`).
- Auth: None
- Tenant: Not required.

## [GET] /api/v1/status/summary

- Summary: Service status summary with version and dependency checks (same readiness data plus version field).
- Auth: None
- Tenant: Not required.
- Success 200: Returns overall status, `ready`, environment, version, timestamp, and dependency checks.
- Example response:

```json
{
	"status": "ok",
	"ready": true,
	"environment": "development",
	"version": "0.1.0",
	"timestamp": "2025-01-01T00:00:00Z",
	"checks": {
		"api": { "status": "ok", "version": "0.1.0" },
		"database": { "status": "ok" },
		"redis": { "status": "ok" }
	}
}
```

## [POST] /api/v1/auth/login/start

- Summary: Step 1 of login — validates email and returns a short-lived challenge token.
- Auth: None
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Request body:

```json
{ "email": "admin@example.com" }
```

- Success 200: `{ "challenge_token": "<jwt>" }` (expires in ~5 minutes).
- Errors: 400 invalid or inactive email; 429 if rate limited/locked out.

## [POST] /api/v1/auth/login/complete

- Summary: Step 2 of login — validates the challenge token and password, issues access/refresh tokens, updates `last_active_at`.
- Auth: None (uses challenge token + password).
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain). `org_id` embedded in the challenge must match the header context.
- Request body:

```json
{
	"challenge_token": "<login-challenge.jwt>",
	"password": "SecretPassword123!"
}
```

- Success 200: `TokenPair` (access_token, refresh_token, token_type="bearer").
- Errors: 400 invalid/expired challenge or tenant mismatch; 401 invalid credentials or inactive user; 429 if rate limited/locked out.

## [POST] /api/v1/auth/login _(legacy single-call alias)_

- Summary: Convenience single-call login; internally performs start + complete in one step. Prefer the two-step flow above.
- Auth: None
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Request body:

```json
{ "email": "admin@example.com", "password": "SecretPassword123!" }
```

- Success 200: `TokenPair`.
- Errors: 401 invalid credentials or inactive user; 429 if rate limited/locked out.

## [POST] /api/v1/auth/refresh

- Summary: Rotate tokens using a refresh token; enforces inactivity timeout and token reuse detection.
- Auth: None (uses refresh token payload).
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Request body:

```json
{ "refresh_token": "<refresh.jwt>" }
```

- Success 200: `TokenPair`.
- Errors: 401 on invalid/expired/reused refresh token or revoked token_version.

## [POST] /api/v1/auth/logout

- Summary: Invalidate current session by bumping `token_version`.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Success 204: No content.

## [GET] /api/v1/auth/me

- Summary: Return current user profile.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Success 200: `UserOut` (id, org_id, email, is_active, is_superuser, mfa_enabled, timestamps).

## [POST] /api/v1/auth/change-password

- Summary: Authenticated password change with token rotation.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Request body:

```json
{
	"current_password": "OldPassword123!",
	"new_password": "NewPassword123!"
}
```

- Success 200: New `TokenPair` (access/refresh) with bumped `token_version`; if the membership was invited, marks `invitation_status=ACCEPTED` and `platform_status=ACTIVE`.
- Errors: 400 incorrect current password, same-as-old password, or failing minimum password length policy; 401 if access token invalid/expired.
- Notes: If the user is flagged to change password, other endpoints return HTTP 403 until this succeeds.
- Side effects: Sets `must_change_password=false`. (Membership statuses are not changed by subsequent password changes.)

## [POST] /api/v1/org/users

- Summary: Onboard a single user into the current org (create/reuse User by email, create OrgMembership).
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy via `X-Tenant-ID` header (or subdomain).
- Permissions: `user.onboard`.
- Request body:

```json
{
	"email": "new.user@example.com",
	"first_name": "New",
	"middle_name": "M",
	"last_name": "User",
	"preferred_name": "N. User",
	"timezone": "America/Los_Angeles",
	"phone_number": "+14085551234",
	"marital_status": "MARRIED",
	"country": "US",
	"state": "CA",
	"address_line1": "123 Main St",
	"address_line2": "Unit 5",
	"postal_code": "94105",
	"temporary_password": "TempPass123!", // optional; if omitted, backend generates one
	"employee_id": "E-1001",
	"employment_start_date": "2024-12-01",
	"employment_status": "ACTIVE"
}
```

- Success 201:

```json
{
	"user": {
		"id": "uuid",
		"org_id": "default",
		"email": "new.user@example.com",
		"first_name": "New",
		"middle_name": "M",
		"last_name": "User",
		"preferred_name": "N. User",
		"timezone": "America/Los_Angeles",
		"phone_number": "+14085551234",
		"is_active": true,
		"is_superuser": false,
		"created_at": "2025-01-01T00:00:00Z"
	},
	"membership": {
		"id": "uuid",
		"org_id": "default",
		"user_id": "uuid",
		"employee_id": "E-1001",
		"employment_start_date": "2024-12-01",
		"employment_status": "ACTIVE",
		"platform_status": "INVITED",
		"invitation_status": "PENDING",
		"invited_at": "2025-01-01T00:00:00Z",
		"accepted_at": null,
		"created_at": "2025-01-01T00:00:00Z"
	},
	"temporary_password": "generated-temp-password-if-user-is-new"
}
```

- Errors: 400 on duplicate email/employee_id within org.

## [GET] /api/v1/org/users/bulk/template

- Summary: Download CSV template for bulk onboarding.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.onboard`.
- Success 200: CSV with header row for onboarding fields (email, first_name, middle_name, last_name, preferred_name, timezone, phone_number, marital_status, country, state, address_line1, address_line2, postal_code, temporary_password, employee_id, employment_start_date, employment_status).

## [POST] /api/v1/org/users/bulk

- Summary: Bulk onboard users via CSV upload; returns per-row successes and errors.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.onboard`.
- Request: multipart/form-data with `file` (CSV).
- Success 200: `BulkOnboardingResult` containing successes and errors. Each success includes the row number, created/reused user + membership, and temp password (if user was new). Each error includes the row number, email/employee_id (if present), and an error message (e.g., validation or duplicate).

## [GET] /api/v1/org/users

- Summary: List users for the current org with membership status.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.view`.
- Query params:
  - `page` (default 1), `page_size` (default 20)
  - `search` (optional; matches user full name, preferred name, or email, case-insensitive, substring)
  - `employment_status` (optional; case-insensitive exact match)
  - `platform_status` (optional; case-insensitive exact match)
- Success 200: `{ "items": [ { "user": { ... }, "membership": { ... } } ], "total": 42 }`

## [GET] /api/v1/org/users/{membership_id}

- Summary: Get a single org membership + user detail.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.view`.
- Success 200: `{ "user": { ... }, "membership": { ... } }`; 404 if not found.

## [PATCH] /api/v1/org/users/{membership_id}

- Summary: Update membership status fields (employment_status, platform_status).
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.manage`.
- Request body:

```json
{
	"employment_status": "ACTIVE",
	"platform_status": "INVITED"
}
```

- Success 200: Updated user + membership; 404 if not found.

## [PATCH] /api/v1/org/users/{membership_id}/profile

- Summary: Update user profile fields (name, contact, marital status, address).
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.manage`.
- Request body (example):

```json
{
	"first_name": "Pat",
	"last_name": "Lee",
	"preferred_name": "Pat",
	"timezone": "America/Los_Angeles",
	"phone_number": "+14085551234",
	"marital_status": "MARRIED",
	"country": "US",
	"state": "CA",
	"address_line1": "123 Main St",
	"address_line2": "Unit 5",
	"postal_code": "94105"
}
```

- Success 200: Updated user + membership; 404 if not found.

## [DELETE] /api/v1/org/users/{membership_id}

- Summary: Delete a membership; if the user has no other memberships, delete the user.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.manage`.
- Success 204: No content; 404 if membership not found.

## [GET] /api/v1/roles

- Summary: List role buckets for the current org.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `role.view`.
- Success 200: `{ "items": [ { "id": "...", "name": "ORG_ADMIN", "description": "...", "is_system_role": true, "permissions": ["user.view", ...] } ] }`

## [POST] /api/v1/roles

- Summary: Create a custom role bucket in the current org.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `role.manage`.
- Request body:

```json
{
	"name": "Custom HR",
	"description": "HR limited",
	"permissions": ["user.view", "user.onboard"]
}
```

- Success 201: `Role` resource with normalized permissions.
- Errors: 400 if name already exists in org.

## [PATCH] /api/v1/roles/{role_id}

- Summary: Update a custom role bucket (name/description/permissions).
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `role.manage`.
- Notes: System roles cannot be edited.
- Success 200: Updated `Role`; 404 if not found; 400 if system role or duplicate name.

## [DELETE] /api/v1/roles/{role_id}

- Summary: Delete a custom role bucket.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `role.manage`.
- Notes: System roles cannot be deleted.
- Success 204; 404 if not found.

## [POST] /api/v1/roles/org/users/{membership_id}/roles

- Summary: Assign roles to a user membership.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `role.manage` AND `user.manage`.
- Constraints: User must be active and membership employment status must be `ACTIVE`; platform status must be `ACTIVE` for non-EMPLOYEE roles (EMPLOYEE is allowed while INVITED during onboarding).
- Request body:

```json
{ "role_ids": ["uuid-of-role-1", "uuid-of-role-2"] }
```

- Success 200: List of assigned `Role`s (idempotent if already assigned).
- Errors: 404 if membership or any role not found.

## [DELETE] /api/v1/roles/org/users/{membership_id}/roles

- Summary: Remove roles from a user membership.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `role.manage` AND `user.manage`.
- Request body:

```json
{ "role_ids": ["uuid-of-role-1", "uuid-of-role-2"] }
```

- Success 204; 404 if membership not found.

## [GET] /api/v1/self/context

- Summary: Return current org details plus the caller’s roles and effective permissions (from roles) in this org.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: Authenticated user.
- Success 200:

```json
{
  "org": { "id": "default", "name": "Default Organization", "slug": "default", "status": "ACTIVE" },
  "roles": [ { "id": "uuid", "name": "EMPLOYEE", "is_system_role": true, "permissions": ["org.dashboard.view", ...] } ],
  "permissions": ["org.dashboard.view", "loan.apply", ...]
}
```

- Notes: Permissions listed are derived from roles; resource-specific ACL permissions are not included in this list.

## [GET] /api/v1/acls

- Summary: List ACL entries for the current org.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `acl.manage`.
- Success 200: `{ "items": [ { "id": "...", "user_id": "...", "resource_type": "...", "resource_id": "...", "permissions": ["user.view"] } ] }`

## [POST] /api/v1/acls

- Summary: Create an ACL entry for a user/resource.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `acl.manage`.
- Request body:

```json
{
	"user_id": "uuid",
	"resource_type": "loan",
	"resource_id": "123",
	"permissions": ["loan.view_all"]
}
```

- Success 201: The created ACL entry.
- Errors: 400 if duplicate; 422 for unknown permission codes.

## [DELETE] /api/v1/acls/{acl_id}

- Summary: Delete an ACL entry.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `acl.manage`.
- Success 204; 404 if not found.

## [POST] /api/v1/org/users/bulk/delete

- Summary: Bulk delete memberships by ID; deletes user when no memberships remain.
- Auth: Bearer access token.
- Tenant: Required in multi-tenancy.
- Permissions: `user.manage`.
- Request body:

```json
{ "membership_ids": ["<id1>", "<id2>"] }
```

- Success 200: `{ "deleted": 2, "not_found": [] }`

## [GET] /api/v1/meta/timezones

- Summary: List supported IANA timezones (curated set).
- Auth: None
- Tenant: Not required.
- Success 200: `{ "timezones": ["America/Los_Angeles", "Europe/London", ...] }`

## [GET] /api/v1/meta/countries

- Summary: List supported countries (ISO codes + names).
- Auth: None
- Tenant: Not required.
- Success 200: `{ "countries": [ { "code": "US", "name": "United States" }, ... ] }`

## [GET] /api/v1/meta/countries/{country_code}/subdivisions

- Summary: List supported subdivisions/states for a country.
- Auth: None
- Tenant: Not required.
- Success 200: `{ "country": "US", "subdivisions": [ { "code": "CA", "name": "California" }, ... ] }`

## Auth Dependency Usage

- `require_authenticated_user`: dependency that wraps `get_current_user`; use on routes that should only ensure the caller is authenticated before adding permission checks later.
- Example:

```python
@router.get("/org/users")
async def list_users(
    user = Depends(require_authenticated_user),
    ctx: TenantContext = Depends(get_tenant_context),
):
    ...
```
