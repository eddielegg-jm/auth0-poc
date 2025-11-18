import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession, setSession } from '$lib/server/session';
import { getUserOrganizations, getOrganizationMembers, getOrganization } from '$lib/server/auth0';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		throw redirect(303, '/');
	}

	try {
		// Fetch user's organizations from Auth0 (source of truth)
		const organizations = await getUserOrganizations(session.user.sub);

		// Handle organization selection logic
		if (!session.user.org_id && organizations.length > 0) {
			// User is not in an organization context yet
			if (organizations.length === 1) {
				// Auto-select if only one organization
				const org = organizations[0];
				
				// Update session with selected organization
				setSession(event, {
					...session,
					user: {
						...session.user,
						org_id: org.id,
						org_name: org.display_name || org.name
					}
				});

				// Redirect to refresh with org context
				throw redirect(303, '/dashboard');
			} else {
				// Multiple organizations - show selection UI
				return {
					user: session.user,
					organizations,
					requiresOrgSelection: true
				};
			}
		}

		// User has org_id or no organizations - show normal dashboard
		// Get member count for each organization
		const orgsWithMembers = await Promise.all(
			organizations.map(async (org) => {
				const members = await getOrganizationMembers(org.id);
				return { ...org, memberCount: members.length };
			})
		);

		// Get current organization details if user has one selected
		let currentOrg = null;
		if (session.user.org_id) {
			currentOrg = await getOrganization(session.user.org_id);
		}

		return {
			user: session.user,
			organizations: orgsWithMembers,
			currentOrg,
			requiresOrgSelection: false
		};
	} catch (error) {
		console.error('Error loading dashboard:', error);
		return {
			user: session.user,
			organizations: [],
			requiresOrgSelection: false
		};
	}
};
