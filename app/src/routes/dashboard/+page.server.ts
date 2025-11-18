import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { getUserOrganizations, getOrganizationMembers } from '$lib/server/auth0';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		throw redirect(303, '/');
	}

	try {
		// Fetch user's organizations from Auth0 (source of truth)
		const organizations = await getUserOrganizations(session.user.sub);

		// Get member count for each organization
		const orgsWithMembers = await Promise.all(
			organizations.map(async (org) => {
				const members = await getOrganizationMembers(org.id);
				return { ...org, memberCount: members.length };
			})
		);

		return {
			user: session.user,
			organizations: orgsWithMembers
		};
	} catch (error) {
		console.error('Error loading dashboard:', error);
		return {
			user: session.user,
			organizations: []
		};
	}
};
