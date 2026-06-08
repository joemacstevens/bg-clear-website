<script lang="ts">
	import type { PageData } from './$types';
	import StatCard from '$lib/components/portal/StatCard.svelte';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { formatCurrency, formatDateTime } from '$lib/utils/format';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard | BG Clear</title>
</svelte:head>

<div class="admin-dashboard">
	<div class="header">
		<h1>Admin Dashboard</h1>
		<p>Welcome back. Here's what's happening today.</p>
	</div>

	<div class="stats-grid">
		<StatCard
			label="Total Products"
			value={data.productCount.toString()}
			color="var(--color-primary)"
		/>
		<StatCard
			label="Active Orders"
			value={data.activeOrderCount.toString()}
			color="var(--color-accent)"
		/>
		<StatCard
			label="Pending Approvals"
			value={data.pendingApprovalCount.toString()}
			color="#f59e0b"
		/>
		<StatCard
			label="Total Revenue"
			value={formatCurrency(data.totalRevenue)}
			color="#10b981"
		/>
	</div>

	<div class="dashboard-grid">
		<div class="quick-links card">
			<h2>Quick Links</h2>
			<div class="links-grid">
				<a href="/admin/products" class="quick-link">
					<span class="icon">📦</span>
					<div class="link-text">
						<strong>Product Management</strong>
						<span>Add, edit, or disable products</span>
					</div>
				</a>
				<a href="/admin/products/import" class="quick-link">
					<span class="icon">📥</span>
					<div class="link-text">
						<strong>Import Products</strong>
						<span>Bulk upload from CSV</span>
					</div>
				</a>
				<a href="/admin/categories" class="quick-link">
					<span class="icon">🗂️</span>
					<div class="link-text">
						<strong>Browse Categories</strong>
						<span>Manage the storefront category tree</span>
					</div>
				</a>
				<a href="/admin/pricing" class="quick-link">
					<span class="icon">💰</span>
					<div class="link-text">
						<strong>Pricing Rules</strong>
						<span>Edit category margins and markup</span>
					</div>
				</a>
				<a href="/admin/users" class="quick-link">
					<span class="icon">👥</span>
					<div class="link-text">
						<strong>User Management</strong>
						<span>Assign reps and roles</span>
					</div>
				</a>
				<a href="/admin/quote-approvals" class="quick-link">
					<span class="icon">✓</span>
					<div class="link-text">
						<strong>Quote Approvals</strong>
						<span>Approve below-target pricing before it's sent</span>
					</div>
				</a>
				<a href="/admin/audit" class="quick-link">
					<span class="icon">📋</span>
					<div class="link-text">
						<strong>Audit Log</strong>
						<span>View system activity</span>
					</div>
				</a>
			</div>
		</div>

		<div class="recent-activity card">
			<div class="activity-header">
				<h2>Recent Activity</h2>
				<a href="/admin/audit" class="view-all">View All</a>
			</div>
			
			{#if data.auditEntries.length === 0}
				<EmptyState
					message="No recent activity found."
					actionLabel="Refresh"
					actionHref="/admin"
				/>
			{:else}
				<div class="activity-list">
					{#each data.auditEntries as entry}
						<div class="activity-item">
							<div class="activity-icon">
								{#if entry.action.includes('create')}
									<span class="badge create">+</span>
								{:else if entry.action.includes('update') || entry.action.includes('status')}
									<span class="badge update">↻</span>
								{:else if entry.action.includes('delete')}
									<span class="badge delete">×</span>
								{:else}
									<span class="badge other">•</span>
								{/if}
							</div>
							<div class="activity-content">
								<p class="activity-text">
									<strong>{entry.action}</strong> {entry.entity_type} {entry.entity_id}
								</p>
								<p class="activity-meta">
									{formatDateTime(entry.created_at)}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.admin-dashboard {
		padding-bottom: var(--space-8);
	}

	.header {
		margin-bottom: var(--space-6);
	}

	.header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 0.25rem;
	}

	.header p {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		box-shadow: var(--shadow-sm);
	}

	.card h2 {
		font-family: var(--font-heading);
		font-size: var(--text-h3);
		margin: 0 0 var(--space-4);
		color: var(--color-ink);
	}

	.links-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	@media (max-width: 600px) {
		.links-grid {
			grid-template-columns: 1fr;
		}
	}

	.quick-link {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: all 0.2s;
	}

	.quick-link:hover {
		border-color: var(--color-primary);
		background: var(--color-bg);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.quick-link .icon {
		font-size: 1.5rem;
		background: var(--color-bg);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
	}

	.link-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.link-text strong {
		font-weight: 600;
		color: var(--color-ink);
		font-size: var(--text-small);
	}

	.link-text span {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.activity-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.view-all {
		font-size: var(--text-small);
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.activity-item {
		display: flex;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.activity-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		font-weight: bold;
		font-size: 1.2rem;
	}
	
	.badge.create { background: #dcfce7; color: #16a34a; }
	.badge.update { background: #dbeafe; color: #2563eb; }
	.badge.delete { background: #fee2e2; color: #dc2626; }
	.badge.other { background: #f1f5f9; color: #64748b; font-size: 1rem; }

	.activity-content {
		flex: 1;
	}

	.activity-text {
		margin: 0 0 0.125rem;
		font-size: var(--text-small);
		color: var(--color-text);
	}

	.activity-text strong {
		color: var(--color-ink);
	}

	.activity-meta {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-muted);
	}
</style>