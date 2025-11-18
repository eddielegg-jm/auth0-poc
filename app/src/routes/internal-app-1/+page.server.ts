import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);
	console.log('[Internal App 1] Session check:', session ? 'Session exists' : 'No session');
	console.log('[Internal App 1] Current URL:', event.url.pathname + event.url.search);

	if (!session || !session.user) {
		// Redirect to login with return URL for standalone access
		// Add a marker to detect when user returns via SSO
		const returnUrl = encodeURIComponent('/internal-app-1?sso=true');
		console.log('[Internal App 1] No session, redirecting to login with returnTo:', returnUrl);
		throw redirect(303, `/api/auth/login?returnTo=${returnUrl}`);
	}

	// Check if this is an SSO redirect return
	const ssoIndicator = event.url.searchParams.get('sso');
	console.log('[Internal App 1] SSO indicator:', ssoIndicator);

	return {
		user: session.user,
		ssoLogin: ssoIndicator === 'true'
	};
};
