import { writable } from 'svelte/store';
import type { User } from '@auth0/auth0-spa-js';

export interface AuthUser extends User {
	org_id?: string;
	org_name?: string;
}

export const user = writable<AuthUser | null>(null);
export const isLoading = writable(true);
export const isAuthenticated = writable(false);
