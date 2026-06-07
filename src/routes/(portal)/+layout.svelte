<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import Footer from '$lib/components/Footer.svelte';

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
			<a href="/" class="nav-logo" title="Back to Homepage">
				<img class="logo-img" src={logo} alt="BG Clear" />
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

			{#if $page.url.pathname.startsWith('/catalog')}
				<div class="header-contact-info">
					<a href="mailto:customercare@bgclear.com" class="contact-icon" aria-label="Email us" title="Email us">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
						</svg>
					</a>
					<a href="tel:+12017657171" class="contact-phone">(201) 765-7171</a>
				</div>
			{/if}

			<div class="nav-user">
				<span class="user-name">{data.profile?.full_name ?? data.user?.email}</span>
				<button class="logout-btn" onclick={handleLogout}>Sign Out</button>
			</div>
		</div>
	</nav>

	<main class="portal-main">
		{@render children()}
	</main>

	{#if $page.url.pathname.startsWith('/catalog')}
		<Footer />
	{/if}
</div>

<style>
	.portal-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}

	.portal-nav {
		background: color-mix(in srgb, var(--color-surface), transparent 8%);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
		transition: background-color 240ms ease;
	}

	.nav-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--space-4);
		height: 64px;
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		text-decoration: none;
	}

	.logo-img {
		height: 32px;
		width: auto;
		display: block;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
	}

	.nav-badge {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--color-accent-light);
		color: var(--color-gold-text);
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
	}

	.nav-links {
		display: flex;
		gap: var(--space-1);
		flex: 1;
	}

	.nav-link {
		padding: 0.5rem 0.85rem;
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		text-decoration: none;
		transition: all 0.2s ease;
		position: relative;
	}

	.nav-link::after {
		content: '';
		position: absolute;
		left: 0.85rem;
		right: 0.85rem;
		bottom: 0.125rem;
		height: 2px;
		background: var(--color-gold);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.25s ease;
	}

	.nav-link:hover {
		color: var(--color-primary);
	}

	.nav-link:hover::after {
		transform: scaleX(1);
	}

	.nav-link.active {
		color: var(--color-primary);
		font-weight: 600;
		background: rgba(30, 58, 95, 0.05);
	}

	.nav-link.active::after {
		transform: scaleX(1);
		background: var(--color-primary);
	}

	.header-contact-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-right: var(--space-2);
	}

	.contact-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		color: var(--color-primary);
		transition: all 160ms ease;
	}

	.contact-icon:hover {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: #ffffff;
		transform: scale(1.05);
	}

	.contact-phone {
		font-family: var(--font-body);
		font-size: var(--text-small);
		color: var(--color-gold);
		font-weight: 600;
		text-decoration: none;
		transition: color 160ms ease;
	}

	.contact-phone:hover {
		color: var(--color-primary);
	}

	.nav-user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.user-name {
		font-size: var(--text-small);
		color: var(--color-muted);
		font-weight: 500;
	}

	.logout-btn {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		background: none;
		border: 1px solid var(--color-border);
		padding: 0.35rem 0.85rem;
		border-radius: var(--radius-pill);
		cursor: pointer;
		font-family: var(--font-body);
		transition: all 0.15s ease;
	}

	.logout-btn:hover {
		color: var(--color-primary);
		border-color: var(--color-primary);
		background: rgba(30, 58, 95, 0.02);
	}

	.portal-main {
		flex: 1;
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
		padding: var(--space-4);
		box-sizing: border-box;
	}

	@media (max-width: 900px) {
		.header-contact-info {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.nav-inner {
			gap: var(--space-2);
			height: 56px;
		}
		.user-name {
			display: none;
		}
		.nav-links {
			overflow-x: auto;
			padding-bottom: 4px;
			scrollbar-width: none;
		}
		.nav-links::-webkit-scrollbar {
			display: none;
		}
		.nav-link {
			padding: 0.375rem 0.65rem;
			font-size: 0.8125rem;
		}
		.nav-link::after {
			display: none;
		}
	}
</style>
