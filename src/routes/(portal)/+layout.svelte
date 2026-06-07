<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
	const supabase = createSupabaseBrowserClient();

	const navItems = $derived(() => {
		const items = [
			{ href: '/catalog', label: 'Catalog' },
			{ href: '/catalog/quotes', label: 'Quotes' },
			{ href: '/catalog/orders', label: 'Orders' }
		];

		if (data.profile?.role === 'admin' || data.profile?.role === 'manager' || data.profile?.role === 'sales_rep') {
			items.push({ href: '/rep', label: 'Rep Dashboard' });
		}
		if (data.profile?.role === 'admin') {
			items.push({ href: '/admin', label: 'Admin' });
		}
		items.push({ href: '/catalog/account', label: 'Account' });
		return items;
	});

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/');
	}
</script>

<div class="portal-layout">
	<nav class="portal-nav">
		<div class="nav-inner">
			<a href="/" class="nav-logo">
				<strong>BG Clear</strong>
				<span class="nav-badge">{data.profile?.role?.replace('_', ' ') ?? 'Portal'}</span>
			</a>

			<div class="nav-links">
				{#each navItems() as item}
					<a
						href={item.href}
						class="nav-link"
						class:active={$page.url.pathname.startsWith(item.href)}
					>
						{item.label}
					</a>
				{/each}
			</div>

			<div class="nav-user">
				<span class="user-name">{data.profile?.full_name ?? data.user?.email}</span>
				<button class="logout-btn" onclick={handleLogout}>Sign Out</button>
			</div>
		</div>
	</nav>

	<main class="portal-main">
		{@render children()}
	</main>
</div>

<style>
	.portal-layout {
		min-height: 100vh;
		background: var(--color-bg);
	}

	.portal-nav {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--space-4);
		height: 56px;
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-heading);
		color: var(--color-ink);
		text-decoration: none;
	}

	.nav-badge {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--color-accent-light);
		color: var(--color-accent);
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
	}

	.nav-links {
		display: flex;
		gap: var(--space-1);
		flex: 1;
	}

	.nav-link {
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		text-decoration: none;
		transition: all 0.15s;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-border-subtle);
	}

	.nav-link.active {
		color: var(--color-primary);
		background: rgba(30, 58, 95, 0.06);
	}

	.nav-user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.user-name {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.logout-btn {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		background: none;
		border: 1px solid var(--color-border);
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-body);
	}

	.logout-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text);
	}

	.portal-main {
		max-width: 1280px;
		margin: 0 auto;
		padding: var(--space-4);
	}

	@media (max-width: 768px) {
		.nav-inner {
			gap: var(--space-2);
		}
		.user-name {
			display: none;
		}
		.nav-links {
			overflow-x: auto;
		}
	}
</style>
