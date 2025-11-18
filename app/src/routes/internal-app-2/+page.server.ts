import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		// Redirect to login with return URL for standalone access
		// Add a marker to detect when user returns via SSO
		const returnUrl = encodeURIComponent('/internal-app-2?sso=true');
		throw redirect(303, `/api/auth/login?returnTo=${returnUrl}`);
	}

	// Check if this is an SSO redirect return
	const ssoIndicator = event.url.searchParams.get('sso');

	return {
		user: session.user,
		ssoLogin: ssoIndicator === 'true'
	};
};
