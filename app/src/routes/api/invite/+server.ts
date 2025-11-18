import { json, type RequestHandler } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { inviteUserToOrganization, getUserOrganizations } from '$lib/server/auth0';
import { auth0Config } from '$lib/config/auth0';

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = getSession(event);

	if (!session || !session.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { email, organizationId } = await request.json();

		if (!email || !organizationId) {
			return json({ error: 'Email and organization ID are required' }, { status: 400 });
		}

		// Verify the user is a member of the organization
		const userOrgs = await getUserOrganizations(session.user.sub);
		const isMember = userOrgs.some((org) => org.id === organizationId);

		if (!isMember) {
			return json(
				{ error: 'You are not authorized to invite users to this organization' },
				{ status: 403 }
			);
		}

		// Send invitation to user
		const result = await inviteUserToOrganization(
			organizationId,
			session.user.name,
			email,
			auth0Config.clientId
		);

		if (result.success) {
			return json({ success: true, message: 'Invitation sent successfully' });
		} else {
			return json({ error: result.error || 'Failed to send invitation' }, { status: 500 });
		}
	} catch (error) {
		console.error('Invitation error:', error);
		return json({ error: 'Failed to process invitation' }, { status: 500 });
	}
};
