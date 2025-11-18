import { redirect, type ServerLoad } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const load: ServerLoad = async (event) => {
	const session = getSession(event);

	if (!session || !session.user) {
		// Redirect to login with return URL for standalone access
		throw redirect(303, `/api/auth/login?returnTo=${encodeURIComponent('/internal-app-2')}`);
	}

	return {
		user: session.user
	};
};
