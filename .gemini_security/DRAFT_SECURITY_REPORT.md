### Newly Introduced Vulnerabilities

*   **Vulnerability:** Incomplete Authentication Bypass (Broken Access Control)
*   **Severity:** Medium
*   **Location:** `src/app/router/route-guards.tsx`
*   **Line Content:**
    ```typescript
    export function RequireAuth({ children }: PropsWithChildren) {
    	const location = useLocation();
    	const { user, isAuthenticating } = useAuth();

    	if (isAuthenticating) {
    		return <LoadingState label="Authenticating..." />;
    	}

    	if (!user) {
    		return <Navigate to={routes.login} state={{ from: location }} replace />;add
    	}

    	return <>{children}</>;
    }
    ```
*   **Description:** The `RequireAuth` route guard does not enforce the `must_change_password` requirement. If a user is authenticated but has the `must_change_password` flag set (e.g., during their first login or after an admin-initiated reset), they can manually navigate to internal application routes (e.g., `/app/workspace`) and bypass the mandatory redirection to the password change page. While backend API calls may still be blocked by server-side checks, the frontend allows unauthorized access to the application shell and potentially sensitive UI metadata.
*   **Recommendation:** Update the `RequireAuth` component to check for the `must_change_password` flag and redirect users to `routes.changePassword` when it is true.
