<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { formatDate, formatCurrency } from '$lib/utils/format';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';

	let { data }: { data: PageData } = $props();
	const profile = $derived(data.profile);
	const orders = $derived(data.orders);
	const quotes = $derived(data.quotes);

	const isCustomerOrRep = $derived(profile.role === 'customer' || profile.role === 'sales_rep');
</script>

<div class="user-detail-page">
	<header class="page-header">
		<div>
			<div class="breadcrumbs">
				<a href="/admin/users">Users</a> <span class="separator">/</span> {profile.full_name || profile.email}
			</div>
			<h1>User Profile</h1>
		</div>
		<StatusBadge status={profile.role} />
	</header>

	<div class="profile-card">
		<div class="info-grid">
			<div class="info-group">
				<span class="label-text">Name</span>
				<span>{profile.full_name || '-'}</span>
			</div>
			<div class="info-group">
				<span class="label-text">Email</span>
				<span>{profile.email}</span>
			</div>
			<div class="info-group">
				<span class="label-text">Company</span>
				<span>{profile.company_name || '-'}</span>
			</div>
			<div class="info-group">
				<span class="label-text">Phone</span>
				<span>{profile.phone || '-'}</span>
			</div>
			<div class="info-group">
				<span class="label-text">Address</span>
				<span>
					{#if profile.address_line1}
						{profile.address_line1} {profile.address_line2 || ''}<br/>
						{profile.city || ''}, {profile.state || ''} {profile.zip || ''}
					{:else}
						-
					{/if}
				</span>
			</div>
			<div class="info-group">
				<span class="label-text">Joined</span>
				<span>{formatDate(profile.created_at)}</span>
			</div>
		</div>
	</div>

	{#if isCustomerOrRep}
		<div class="two-col-layout">
			<section class="list-section">
				<div class="section-header">
					<h2>Recent Quotes</h2>
					<span class="count-badge">{quotes.length}</span>
				</div>
				{#if quotes.length > 0}
					<div class="list-container">
						{#each quotes.slice(0, 10) as quote}
							<div class="list-item">
								<div class="item-main">
									<strong>Quote {quote.id.substring(0, 8)}</strong>
									<span class="text-muted text-sm">{formatDate(quote.created_at)}</span>
								</div>
								<div class="item-side">
									<StatusBadge 
										status={quote.status} 
										labels={QUOTE_STATUS_LABELS} 
										colors={QUOTE_STATUS_COLORS} 
									/>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<EmptyState message="No quotes found for this user." />
				{/if}
			</section>

			<section class="list-section">
				<div class="section-header">
					<h2>Recent Orders</h2>
					<span class="count-badge">{orders.length}</span>
				</div>
				{#if orders.length > 0}
					<div class="list-container">
						{#each orders.slice(0, 10) as order}
							<div class="list-item">
								<div class="item-main">
									<strong>Order #{order.order_number}</strong>
									<span class="text-muted text-sm">{formatDate(order.created_at)}</span>
								</div>
								<div class="item-side">
									<strong>{formatCurrency(order.subtotal || 0)}</strong>
									<StatusBadge 
										status={order.status} 
										labels={ORDER_STATUS_LABELS} 
										colors={ORDER_STATUS_COLORS} 
									/>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<EmptyState message="No orders found for this user." />
				{/if}
			</section>
		</div>
	{/if}
</div>

<style>
	.user-detail-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.breadcrumbs {
		font-size: 0.875rem;
		color: var(--color-muted);
		margin-bottom: var(--space-2);
	}

	.breadcrumbs a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		text-decoration: underline;
	}

	.separator {
		margin: 0 var(--space-2);
	}

	.page-header h1 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 1.5rem;
		color: var(--color-ink);
	}

	.profile-card {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		padding: var(--space-6);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-6);
	}

	.info-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.info-group .label-text {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		font-weight: 600;
	}

	.info-group span {
		font-size: 0.875rem;
		color: var(--color-ink);
	}

	.two-col-layout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--space-6);
	}

	.list-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.section-header h2 {
		margin: 0;
		font-size: 1.125rem;
		color: var(--color-ink);
	}

	.count-badge {
		background: var(--color-bg);
		color: var(--color-muted);
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		border: 1px solid var(--color-border);
	}

	.list-container {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.list-item:last-child {
		border-bottom: none;
	}

	.item-main {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.text-muted {
		color: var(--color-muted);
	}

	.text-sm {
		font-size: 0.75rem;
	}
</style>
