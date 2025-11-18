import { json, type RequestHandler } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { inviteUserToOrganization, getUserOrganizations } from '$lib/server/auth0';
import { createUser } from '$lib/server/user-management';
import { canInviteUsers } from '$lib/rbac/roles';
import { auth0Config } from '$lib/config/auth0';

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = getSession(event);

	if (!session || !session.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { email, name, organizationId, createNewUser } = await request.json();

		if (!email || !organizationId) {
			return json({ error: 'Email and organization ID are required' }, { status: 400 });
		}

		// Check RBAC permission
		if (!canInviteUsers(session.user.sub, organizationId)) {
			return json({ error: 'You do not have permission to invite users' }, { status: 403 });
		}

		// Verify the user is a member of the organization
		const userOrgs = await getUserOrganizations(session.user.sub);
		const isMember = userOrgs.some(org => org.id === organizationId);

		if (!isMember) {
			return json({ error: 'You are not authorized to invite users to this organization' }, { status: 403 });
		}

		// Create new user or send invitation to existing user
		if (createNewUser) {
			// Create a new user and assign to organization
			const result = await createUser({
				email,
				name: name || email.split('@')[0],
				organizationId,
				sendVerificationEmail: true
			});

			if (result.success) {
				return json({ 
					success: true, 
					message: 'User created and verification email sent',
					userId: result.userId
				});
			} else {
				return json({ error: result.error || 'Failed to create user' }, { status: 500 });
			}
		} else {
			// Send invitation to existing user
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
		}
	} catch (error) {
		console.error('Invitation error:', error);
		return json({ error: 'Failed to process invitation' }, { status: 500 });
	}
};
