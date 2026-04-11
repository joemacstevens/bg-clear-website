<script lang="ts">
	import { page } from '$app/stores';

	let { children } = $props();

	const subnav = [
		{ href: '/rep', label: 'Dashboard', exact: true },
		{ href: '/rep/pricing', label: 'Pricing Table' },
		{ href: '/rep/quotes', label: 'Quotes' },
		{ href: '/rep/orders', label: 'Orders' },
		{ href: '/rep/commissions', label: 'Commissions' },
		{ href: '/rep/customers', label: 'Customers' }
	];
</script>

<div class="rep-layout">
	<nav class="rep-subnav">
		{#each subnav as item}
			<a
				href={item.href}
				class="subnav-link"
				class:active={item.exact ? $page.url.pathname === item.href : $page.url.pathname.startsWith(item.href)}
			>
				{item.label}
			</a>
		{/each}
	</nav>
	<div class="rep-content">
		{@render children()}
	</div>
</div>

<style>
	.rep-layout {
		display: flex;
		gap: var(--space-4);
		min-height: calc(100vh - 56px - var(--space-4) * 2);
	}

	.rep-subnav {
		width: 200px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-top: var(--space-1);
	}

	.subnav-link {
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		text-decoration: none;
		transition: all 0.15s;
	}

	.subnav-link:hover {
		color: var(--color-text);
		background: var(--color-border-subtle);
	}

	.subnav-link.active {
		color: var(--color-primary);
		background: rgba(30, 58, 95, 0.06);
		font-weight: 600;
	}

	.rep-content {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.rep-layout {
			flex-direction: column;
		}
		.rep-subnav {
			width: 100%;
			flex-direction: row;
			overflow-x: auto;
			gap: 0.5rem;
			padding-bottom: var(--space-2);
			border-bottom: 1px solid var(--color-border);
		}
		.subnav-link {
			white-space: nowrap;
		}
	}
</style>
