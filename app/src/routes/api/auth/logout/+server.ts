import { redirect, type RequestHandler } from '@sveltejs/kit';
import { clearSession } from '$lib/server/session';
import { auth0Config } from '$lib/config/auth0';

export const POST: RequestHandler = async (event) => {
	const { url } = event;
	
	// Clear session
	clearSession(event);

	// Build logout URL
	const logoutUrl = new URL(`https://${auth0Config.domain}/v2/logout`);
	logoutUrl.searchParams.set('client_id', auth0Config.clientId);
	logoutUrl.searchParams.set('returnTo', url.origin);

	return new Response(JSON.stringify({ logoutUrl: logoutUrl.toString() }), {
		headers: { 'Content-Type': 'application/json' }
	});
};

export const GET: RequestHandler = async (event) => {
	clearSession(event);
	throw redirect(303, '/');
};
