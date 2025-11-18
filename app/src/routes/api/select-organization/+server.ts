import { json, type RequestHandler } from '@sveltejs/kit';
import { getSession, setSession } from '$lib/server/session';
import { getUserOrganizations, getOrganization } from '$lib/server/auth0';

/**
 * POST handler to select an organization for the current user
 */
export const POST: RequestHandler = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { organizationId } = await event.request.json();

		if (!organizationId) {
			return json({ error: 'Organization ID is required' }, { status: 400 });
		}

		// Verify user belongs to this organization
		const userOrgs = await getUserOrganizations(session.user.sub);
		const belongsToOrg = userOrgs.some(org => org.id === organizationId);

		if (!belongsToOrg) {
			return json({ error: 'User does not belong to this organization' }, { status: 403 });
		}

		// Get organization details
		const org = await getOrganization(organizationId);
		
		if (!org) {
			return json({ error: 'Organization not found' }, { status: 404 });
		}

		// Update session with selected organization
		setSession(event, {
			...session,
			user: {
				...session.user,
				org_id: org.id,
				org_name: org.display_name || org.name
			}
		});

		return json({ success: true, organization: org });
	} catch (error) {
		console.error('Error selecting organization:', error);
		return json({ error: 'Failed to select organization' }, { status: 500 });
	}
};
