<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');
	let notice = $state('');
	let mode = $state<'login' | 'register' | 'forgot'>('login');

	// Registration fields
	let fullName = $state('');
	let companyName = $state('');
	let phone = $state('');

	const supabase = createSupabaseBrowserClient();

	async function handleLogin() {
		loading = true;
		error = '';

		const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

		if (authError) {
			error = authError.message;
			loading = false;
			return;
		}

		const redirect = $page.url.searchParams.get('redirect') || '/catalog';
		goto(redirect);
	}

	async function handleRegister() {
		loading = true;
		error = '';

		if (!fullName.trim()) {
			error = 'Full name is required';
			loading = false;
			return;
		}

		const { data: signUpData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName,
					role: 'customer'
				}
			}
		});

		if (authError) {
			error = authError.message;
			loading = false;
			return;
		}

		// If email confirmation is required, the session will be null
		if (!signUpData.session) {
			// Try to sign in immediately (works if email confirmation is disabled)
			const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
			if (signInError) {
				// Email confirmation is likely required
				error = 'Account created! Please check your email to confirm, then sign in.';
				mode = 'login';
				loading = false;
				return;
			}
		}

		// Update profile with additional info
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			await supabase.from('profiles').update({
				company_name: companyName || null,
				phone: phone || null
			}).eq('id', user.id);
		}

		const redirect = $page.url.searchParams.get('redirect') || '/catalog';
		goto(redirect);
	}

	async function handleForgot() {
		loading = true;
		error = '';
		notice = '';

		if (!email.trim()) {
			error = 'Enter your email and we’ll send a reset link.';
			loading = false;
			return;
		}

		const redirectTo = `${window.location.origin}/callback?next=/reset-password`;
		const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
			redirectTo
		});

		if (resetError) {
			error = resetError.message;
			loading = false;
			return;
		}

		// Don't reveal whether the email exists — always show the same confirmation.
		notice =
			'If an account exists for that email, a password reset link is on its way. Check your inbox (and spam).';
		loading = false;
	}

	function switchMode(next: 'login' | 'register' | 'forgot') {
		mode = next;
		error = '';
		notice = '';
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (mode === 'login') handleLogin();
		else if (mode === 'forgot') handleForgot();
		else handleRegister();
	}
</script>

<svelte:head>
	<title>{mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Reset Password' : 'Create Account'} | BG Clear</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<div class="auth-header">
			<h1>{mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Reset Password' : 'Create Account'}</h1>
			<p>
				{mode === 'login'
					? 'Access the BG Clear product catalog'
					: mode === 'forgot'
						? 'Enter your email and we’ll send you a reset link.'
						: 'Register to view our DME product catalog'}
			</p>
		</div>

		{#if error}
			<div class="error-banner">{error}</div>
		{/if}

		{#if notice}
			<div class="notice-banner">{notice}</div>
		{/if}

		<form onsubmit={handleSubmit}>
			{#if mode === 'register'}
				<div class="form-group">
					<label for="fullName">Full Name *</label>
					<input id="fullName" type="text" bind:value={fullName} required placeholder="Your full name" />
				</div>

				<div class="form-group">
					<label for="companyName">Company / Organization</label>
					<input id="companyName" type="text" bind:value={companyName} placeholder="Pharmacy or clinic name" />
				</div>

				<div class="form-group">
					<label for="phone">Phone</label>
					<input id="phone" type="tel" bind:value={phone} placeholder="(201) 555-0100" />
				</div>
			{/if}

			<div class="form-group">
				<label for="email">Email</label>
				<input id="email" type="email" bind:value={email} required placeholder="you@company.com" />
			</div>

			{#if mode !== 'forgot'}
				<div class="form-group">
					<label for="password">Password</label>
					<input id="password" type="password" bind:value={password} required minlength="6" placeholder="••••••••" />
				</div>
			{/if}

			{#if mode === 'login'}
				<div class="forgot-row">
					<button type="button" class="link-btn" onclick={() => switchMode('forgot')}>Forgot password?</button>
				</div>
			{/if}

			<button type="submit" class="btn-primary" disabled={loading}>
				{#if loading}
					Working...
				{:else if mode === 'login'}
					Sign In
				{:else if mode === 'forgot'}
					Send reset link
				{:else}
					Create Account
				{/if}
			</button>
		</form>

		<div class="auth-footer">
			{#if mode === 'login'}
				<p>Don't have an account? <button class="link-btn" onclick={() => switchMode('register')}>Register here</button></p>
			{:else if mode === 'forgot'}
				<p>Remembered it? <button class="link-btn" onclick={() => switchMode('login')}>Back to sign in</button></p>
			{:else}
				<p>Already registered? <button class="link-btn" onclick={() => switchMode('login')}>Sign in</button></p>
			{/if}
		</div>
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

	.error-banner {
		background: #fef2f2;
		color: #dc2626;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		margin-bottom: var(--space-3);
	}

	.notice-banner {
		background: #ecfdf5;
		color: #047857;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		margin-bottom: var(--space-3);
		line-height: 1.4;
	}

	.forgot-row {
		text-align: right;
		margin-bottom: var(--space-3);
		margin-top: calc(-1 * var(--space-1));
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

	.auth-footer {
		text-align: center;
		margin-top: var(--space-3);
	}

	.auth-footer p {
		color: var(--color-muted);
		font-size: var(--text-small);
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		font-size: inherit;
		font-family: inherit;
	}

	.link-btn:hover {
		text-decoration: underline;
	}
</style>
