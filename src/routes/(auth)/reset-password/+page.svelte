<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let password = $state('');
	let confirm = $state('');
	let loading = $state(false);
	let error = $state('');
	let done = $state(false);

	// While we confirm the recovery session exists.
	let checking = $state(true);
	let hasSession = $state(false);

	const supabase = createSupabaseBrowserClient();

	onMount(async () => {
		// The /callback route exchanged the recovery code for a session before
		// redirecting here, so a valid session means the link was good.
		const {
			data: { session }
		} = await supabase.auth.getSession();
		hasSession = !!session;
		checking = false;
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (password.length < 6) {
			error = 'Password must be at least 6 characters.';
			return;
		}
		if (password !== confirm) {
			error = 'Those passwords don’t match.';
			return;
		}

		loading = true;
		const { error: updErr } = await supabase.auth.updateUser({ password });

		if (updErr) {
			error = updErr.message;
			loading = false;
			return;
		}

		done = true;
		loading = false;
		setTimeout(() => goto('/catalog'), 1600);
	}
</script>

<svelte:head>
	<title>Set a New Password | BG Clear</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Set a New Password</h1>
			<p>Choose a new password for your BG Clear account.</p>
		</div>

		{#if checking}
			<p class="muted">Verifying your reset link…</p>
		{:else if !hasSession}
			<div class="error-banner">
				This password reset link is invalid or has expired. Request a new one to continue.
			</div>
			<a class="btn-primary btn-link" href="/login">Back to sign in</a>
		{:else if done}
			<div class="notice-banner">Password updated — taking you to your catalog…</div>
		{:else}
			{#if error}
				<div class="error-banner">{error}</div>
			{/if}

			<form onsubmit={handleSubmit}>
				<div class="form-group">
					<label for="password">New password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						minlength="6"
						autocomplete="new-password"
						placeholder="••••••••"
					/>
				</div>

				<div class="form-group">
					<label for="confirm">Confirm new password</label>
					<input
						id="confirm"
						type="password"
						bind:value={confirm}
						required
						minlength="6"
						autocomplete="new-password"
						placeholder="••••••••"
					/>
				</div>

				<button type="submit" class="btn-primary" disabled={loading}>
					{loading ? 'Saving…' : 'Update password'}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background: var(--color-bg);
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: var(--shadow-lg);
	}

	.auth-header {
		text-align: center;
		margin-bottom: var(--space-4);
	}

	.auth-header h1 {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.auth-header p {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: 0;
	}

	.muted {
		text-align: center;
		color: var(--color-muted);
		font-size: var(--text-small);
	}

	.error-banner {
		background: #fef2f2;
		color: #dc2626;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		margin-bottom: var(--space-3);
		line-height: 1.4;
	}

	.notice-banner {
		background: #ecfdf5;
		color: #047857;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		line-height: 1.4;
	}

	.form-group {
		margin-bottom: var(--space-3);
	}

	label {
		display: block;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	input {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-body);
		font-family: var(--font-body);
		transition: border-color 0.15s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
	}

	.btn-primary {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-body);
		font-weight: 600;
		font-family: var(--font-heading);
		cursor: pointer;
		transition: background 0.15s;
		margin-top: var(--space-1);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-link {
		display: block;
		text-align: center;
		text-decoration: none;
		box-sizing: border-box;
	}
</style>
