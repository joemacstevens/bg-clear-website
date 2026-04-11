<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toast';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { formatDate } from '$lib/utils/format';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	$effect(() => {
		if (form?.success) {
			toasts.success('User updated successfully');
		}
		if (form?.error) {
			toasts.error(form.error);
		}
	});

	let searchQuery = $state('');

	const filteredProfiles = $derived(
		data.profiles.filter(p => {
			const search = searchQuery.toLowerCase();
			return (
				(p.full_name && p.full_name.toLowerCase().includes(search)) ||
				(p.email && p.email.toLowerCase().includes(search)) ||
				(p.company_name && p.company_name.toLowerCase().includes(search))
			);
		})
	);

	const roleLabels = {
		customer: 'Customer',
		sales_rep: 'Sales Rep',
		manager: 'Manager',
		admin: 'Admin'
	};

	const roleColors = {
		customer: '#64748b',
		sales_rep: '#2563eb',
		manager: '#7c3aed',
		admin: '#b45309'
	};

	function submitOnChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		if (select && select.form) {
			select.form.requestSubmit();
		}
	}
</script>

<div class="users-page">
	<header class="page-header">
		<div>
			<h1>User Management</h1>
			<p class="text-muted">Manage roles and assigned reps for all portal users.</p>
		</div>
		<div class="header-actions">
			<input 
				type="search" 
				placeholder="Search users..." 
				class="search-input"
				bind:value={searchQuery}
			/>
		</div>
	</header>

	<div class="table-container">
		<table class="data-table">
			<thead>
				<tr>
					<th>Name / Email</th>
					<th>Company</th>
					<th>Role</th>
					<th>Assigned Rep</th>
					<th>Joined</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredProfiles as profile}
					<tr>
						<td>
							<div class="user-info">
								<strong>{profile.full_name || 'No name'}</strong>
								<span class="user-email">{profile.email}</span>
							</div>
						</td>
						<td>{profile.company_name || '-'}</td>
						<td>
							<form method="POST" action="?/changeRole" use:enhance class="inline-form">
								<input type="hidden" name="userId" value={profile.id} />
								<select name="role" value={profile.role} onchange={submitOnChange} class="role-select" style="--role-color: {roleColors[profile.role]}">
									<option value="customer">Customer</option>
									<option value="sales_rep">Sales Rep</option>
									<option value="manager">Manager</option>
									<option value="admin">Admin</option>
								</select>
							</form>
						</td>
						<td>
							{#if profile.role === 'customer'}
								<form method="POST" action="?/assignRep" use:enhance class="inline-form">
									<input type="hidden" name="userId" value={profile.id} />
									<select name="repId" value={profile.assigned_rep_id || 'none'} onchange={submitOnChange} class="rep-select">
										<option value="none">Unassigned</option>
										{#each data.reps as rep}
											<option value={rep.id}>{rep.full_name || rep.email}</option>
										{/each}
									</select>
								</form>
							{:else}
								<span class="text-muted text-sm">-</span>
							{/if}
						</td>
						<td class="text-sm text-muted">
							{formatDate(profile.created_at)}
						</td>
						<td>
							<a href="/admin/users/{profile.id}" class="btn-link">View Details</a>
						</td>
					</tr>
				{/each}
				{#if filteredProfiles.length === 0}
					<tr>
						<td colspan="6" class="empty-state">
							No users found.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.users-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.page-header h1 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 1.5rem;
		color: var(--color-ink);
	}

	.text-muted {
		color: var(--color-muted);
		margin: 0;
	}

	.text-sm {
		font-size: 0.875rem;
	}

	.search-input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		width: 250px;
	}

	.table-container {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.data-table th,
	.data-table td {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		vertical-align: middle;
	}

	.data-table th {
		background: var(--color-bg);
		font-weight: 600;
		font-size: 0.75rem;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.data-table tbody tr:last-child td {
		border-bottom: none;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.user-email {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.inline-form {
		margin: 0;
	}

	select {
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.875rem;
		color: var(--color-ink);
		cursor: pointer;
	}

	select.role-select {
		color: var(--role-color);
		font-weight: 600;
		border-color: currentColor;
		background: transparent;
	}

	.btn-link {
		font-size: 0.875rem;
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.btn-link:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-muted);
		font-style: italic;
	}
</style>
