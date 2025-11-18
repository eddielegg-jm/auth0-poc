import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);
	
	if (session && session.user) {
		throw redirect(303, '/dashboard');
	}

	return {
		error: event.url.searchParams.get('error')
	};
};
