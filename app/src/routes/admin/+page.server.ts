import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { getUserOrganizations } from '$lib/server/auth0';
import { isAdmin, getAllUserRoles } from '$lib/rbac/roles';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		throw redirect(303, '/');
	}

	// Get user's organizations
	const organizations = await getUserOrganizations(session.user.sub);

	// Check if user is admin in at least one organization
	const hasAdminAccess = organizations.some(org => isAdmin(session.user!.sub, org.id));

	if (!hasAdminAccess) {
		throw redirect(303, '/dashboard?error=access_denied');
	}

	// Get user's roles across all organizations
	const userRoles = getAllUserRoles(session.user.sub);

	return {
		user: session.user,
		organizations,
		userRoles
	};
};
