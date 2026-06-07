import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');

	if (code) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	// Honor a `next` destination (e.g. password recovery → /reset-password),
	// but only same-site relative paths to avoid open-redirect abuse.
	const next = url.searchParams.get('next');
	const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/catalog';

	throw redirect(303, safeNext);
};
