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

	// Check for invitation or organization parameters
	const invitation = event.url.searchParams.get('invitation');
	const organization = event.url.searchParams.get('organization');
	
	// If invitation/organization params exist, preserve them in the redirect
	let loginUrl = '/api/auth/login';
	if (invitation || organization) {
		const params = new URLSearchParams();
		if (invitation) params.set('invitation', invitation);
		if (organization) params.set('organization', organization);
		loginUrl = `/api/auth/login?${params.toString()}`;
		console.log('Invitation detected, redirecting with params:', loginUrl);
	} else {
		console.log('No session found, redirecting to login');
	}

	throw redirect(303, loginUrl);
};
