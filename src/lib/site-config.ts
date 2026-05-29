/**
 * Site-level config that needs to flip per environment.
 * Reads from PUBLIC_SITE_URL dynamically so unset envs don't break the
 * build — falls back to the production URL.
 */
import { env } from '$env/dynamic/public';

/** Absolute base URL of the running site (no trailing slash). */
export const SITE_URL: string = (env.PUBLIC_SITE_URL ?? 'https://www.bgclear.com').replace(
	/\/$/,
	''
);
