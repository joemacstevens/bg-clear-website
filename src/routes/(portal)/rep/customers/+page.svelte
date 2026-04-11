<script lang="ts">
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>My Customers | BG Clear</title></svelte:head>

<div class="customers-page">
	<h1>My Customers</h1>

	{#if data.customers.length === 0}
		<EmptyState message="No customers assigned yet. Customers are assigned to you by admin." />
	{:else}
		<div class="customer-grid">
			{#each data.customers as customer}
				<a href="/rep/customers/{customer.id}" class="customer-card">
					<div class="avatar">{(customer.company_name || customer.full_name || '?').charAt(0).toUpperCase()}</div>
					<div class="customer-info">
						<span class="company">{customer.company_name || '—'}</span>
						<span class="name">{customer.full_name}</span>
						<span class="contact">{customer.email}</span>
						{#if customer.phone}<span class="contact">{customer.phone}</span>{/if}
					</div>
					<span class="joined">Since {formatDate(customer.created_at)}</span>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.customers-page h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; margin: 0 0 var(--space-4); }
	.customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-3); }
	.customer-card {
		display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3);
		background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);
		text-decoration: none; color: inherit; transition: all 0.15s;
	}
	.customer-card:hover { box-shadow: var(--shadow-sm); border-color: var(--color-primary); }
	.avatar {
		width: 48px; height: 48px; border-radius: 50%; background: var(--color-primary); color: white;
		display: flex; align-items: center; justify-content: center; font-family: var(--font-heading);
		font-weight: 700; font-size: 1.25rem; flex-shrink: 0;
	}
	.customer-info { flex: 1; display: flex; flex-direction: column; }
	.company { font-weight: 600; font-size: var(--text-small); }
	.name { font-size: 0.75rem; color: var(--color-muted); }
	.contact { font-size: 0.75rem; color: var(--color-muted); }
	.joined { font-size: 0.7rem; color: var(--color-muted); white-space: nowrap; }
</style>
