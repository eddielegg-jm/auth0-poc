import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);
	
	// If user has a valid session, redirect to dashboard
	if (session && session.user) {
		throw redirect(303, '/dashboard');
	}

	// If there's an error from Auth0, show the error page
	const error = event.url.searchParams.get('error');
	if (error) {
		console.log('Showing error page for:', error);
		return { error };
	}

	// No session and no error - redirect to Auth0 login
	console.log('No session found, redirecting to login');
	throw redirect(303, '/api/auth/login');
};
