import { Navigate, useParams } from "react-router-dom";

export function LegacyUserDetailRedirect() {
	const { membershipId } = useParams();
	return (
		<Navigate
			to={`/app/people/users/${membershipId ?? ""}`}
			replace
		/>
	);
}
