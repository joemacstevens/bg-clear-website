import { createSupabaseServerClient } from '$lib/supabase';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Track whether response has been sent to avoid cookie errors
	let responseSent = false;

	event.locals.supabase = createSupabaseServerClient({
		getAll: () => event.cookies.getAll(),
		setAll: (cookiesToSet) => {
			if (responseSent) return;
			try {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			} catch {
				// Cookies can't be set after response — safe to ignore
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) return { session: null, user: null, profile: null };

		const {
			data: { user }
		} = await event.locals.supabase.auth.getUser();

		if (!user) return { session: null, user: null, profile: null };

		// Fetch profile with role
		const { data: profile } = await event.locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		return { session, user, profile };
	};

	// Protect portal routes
	const portalRoutes = ['/catalog', '/admin', '/rep', '/account'];
	const isPortalRoute = portalRoutes.some((route) => event.url.pathname.startsWith(route));

	if (isPortalRoute) {
		const { session, profile } = await event.locals.safeGetSession();

		if (!session) {
			throw redirect(303, '/login?redirect=' + event.url.pathname);
		}

		// Role-based route protection
		if (event.url.pathname.startsWith('/admin') && profile?.role !== 'admin') {
			throw redirect(303, '/catalog');
		}
		if (event.url.pathname.startsWith('/rep') && !['sales_rep', 'manager', 'admin'].includes(profile?.role ?? '')) {
			throw redirect(303, '/catalog');
		}
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});

	responseSent = true;
	return response;
};
