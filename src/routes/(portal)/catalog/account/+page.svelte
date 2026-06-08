<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { toasts } from '$lib/stores/toast';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);

	$effect(() => {
		if (form?.success) {
			toasts.success('Profile updated successfully');
			saving = false;
		}
		if (form?.error) {
			toasts.error(form.error);
			saving = false;
		}
	});
</script>

<svelte:head>
	<title>Account | BG Clear</title>
</svelte:head>

<div class="account-page">
	<div class="page-header">
		<h1>Account</h1>
		<p>Manage your profile and contact information.</p>
	</div>

	{#if data.profile}
		<div class="account-info">
			{#if (data.profile as any).account_number}
				<div class="info-row">
					<span class="info-label">Account #</span>
					<span class="info-value account-number">{(data.profile as any).account_number}</span>
				</div>
			{/if}
			<div class="info-row">
				<span class="info-label">Email</span>
				<span class="info-value">{data.profile.email}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Role</span>
				<span class="info-value role-badge">{data.profile.role.replace(/_/g, ' ')}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Member since</span>
				<span class="info-value">{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(data.profile.created_at))}</span>
			</div>
		</div>

		<form method="POST" action="?/update" class="profile-form" onsubmit={() => { saving = true; }}>
			<h2>Edit Profile</h2>

			<div class="form-grid">
				<div class="form-field">
					<label for="full_name">Full Name *</label>
					<input id="full_name" name="full_name" type="text" required value={data.profile.full_name} />
				</div>

				<div class="form-field">
					<label for="company_name">Company Name</label>
					<input id="company_name" name="company_name" type="text" value={data.profile.company_name ?? ''} />
				</div>

				<div class="form-field">
					<label for="phone">Phone</label>
					<input id="phone" name="phone" type="tel" value={data.profile.phone ?? ''} />
				</div>
			</div>

			<h3>Address</h3>
			<div class="form-grid">
				<div class="form-field full-width">
					<label for="address_line1">Address Line 1</label>
					<input id="address_line1" name="address_line1" type="text" value={data.profile.address_line1 ?? ''} />
				</div>

				<div class="form-field full-width">
					<label for="address_line2">Address Line 2</label>
					<input id="address_line2" name="address_line2" type="text" value={data.profile.address_line2 ?? ''} />
				</div>

				<div class="form-field">
					<label for="city">City</label>
					<input id="city" name="city" type="text" value={data.profile.city ?? ''} />
				</div>

				<div class="form-field">
					<label for="state">State</label>
					<input id="state" name="state" type="text" value={data.profile.state ?? ''} />
				</div>

				<div class="form-field">
					<label for="zip">ZIP Code</label>
					<input id="zip" name="zip" type="text" value={data.profile.zip ?? ''} />
				</div>
			</div>

			<div class="form-actions">
				<button type="submit" class="save-btn" disabled={saving}>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	{:else}
		<p class="no-profile">Unable to load profile information.</p>
	{/if}
</div>

<style>
	.account-page {
		padding-bottom: var(--space-8);
		max-width: 720px;
	}

	.page-header {
		margin-bottom: var(--space-5);
	}

	.page-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.page-header p {
		color: var(--color-muted);
		margin: 0;
	}

	.account-info {
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-5);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border-subtle);
		font-size: var(--text-small);
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		color: var(--color-muted);
		font-weight: 500;
	}

	.info-value {
		color: var(--color-ink);
		font-weight: 500;
	}

	.account-number {
		font-weight: 700;
		color: var(--color-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
	}

	.role-badge {
		text-transform: capitalize;
		padding: 0.125rem 0.5rem;
		background: var(--color-accent-light);
		color: var(--color-accent);
		border-radius: var(--radius-pill);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.profile-form {
		padding: var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.profile-form h2 {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-3);
	}

	.profile-form h3 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-ink);
		margin: var(--space-3) 0 var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.form-field.full-width {
		grid-column: 1 / -1;
	}

	.form-field label {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-text);
	}

	.form-field input {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
		color: var(--color-text);
	}

	.form-field input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
	}

	.form-actions {
		margin-top: var(--space-4);
		display: flex;
		justify-content: flex-end;
	}

	.save-btn {
		padding: 0.5rem 1.5rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		font-family: var(--font-body);
		cursor: pointer;
		transition: background 0.15s;
	}

	.save-btn:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.no-profile {
		text-align: center;
		color: var(--color-muted);
		padding: var(--space-8);
	}

	@media (max-width: 640px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
