import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession, setSession } from '$lib/server/session';
import { getUserOrganizations, getOrganizationMembers, getOrganization, getUserPermissionsInOrganization } from '$lib/server/auth0';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		throw redirect(303, '/');
	}

	try {
		// Fetch user's organizations from Auth0 (source of truth)
		console.log('Fetching organizations for user:', session.user.sub);
		const organizations = await getUserOrganizations(session.user.sub);
		console.log('Found organizations:', organizations.length);

		// Handle organization selection logic
		if (!session.user.org_id && organizations.length > 0) {
			// User is not in an organization context yet
			if (organizations.length === 1) {
				// Auto-select if only one organization
				const org = organizations[0];
				
				// Update session with selected organization
				const updatedSession = {
					...session,
					user: {
						...session.user,
						org_id: org.id,
						org_name: org.display_name || org.name
					}
				};
				setSession(event, updatedSession);

				// Update the local session variable to use the updated data
				session.user.org_id = org.id;
				session.user.org_name = org.display_name || org.name;
				
				// Continue with the updated session instead of redirecting
			} else if (organizations.length > 1) {
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
		let userRolesAndPermissions = null;
		if (session.user.org_id) {
			currentOrg = await getOrganization(session.user.org_id);
			// Get user's roles and permissions in the current organization
			userRolesAndPermissions = await getUserPermissionsInOrganization(
				session.user.sub,
				session.user.org_id
			);
		}

		return {
			user: session.user,
			organizations: orgsWithMembers,
			currentOrg,
			userRolesAndPermissions,
			requiresOrgSelection: false
		};
	} catch (error) {
		// Re-throw redirects - they're not actually errors
		if (error instanceof Response && error.status >= 300 && error.status < 400) {
			throw error;
		}
		console.error('Error loading dashboard:', error);
		return {
			user: session.user,
			organizations: [],
			requiresOrgSelection: false
		};
	}
};
