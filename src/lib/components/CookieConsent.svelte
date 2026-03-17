<script lang="ts">
	import { browser } from '$app/environment';

	let visible = $state(false);
	let dismissed = $state(false);

	$effect(() => {
		if (!browser) return;
		const consent = localStorage.getItem('cookie-consent');
		if (!consent) {
			visible = true;
		}
	});

	function accept() {
		localStorage.setItem('cookie-consent', 'accepted');
		dismissed = true;
		setTimeout(() => (visible = false), 400);
	}

	function decline() {
		localStorage.setItem('cookie-consent', 'declined');
		dismissed = true;
		setTimeout(() => (visible = false), 400);
	}
</script>

{#if visible}
	<div
		class="cookie-banner"
		class:dismissed
		role="region"
		aria-label="Cookie consent"
	>
		<div class="cookie-inner">
			<p class="cookie-text">
				We use cookies to improve your experience. By continuing to use this site, you agree to our use of cookies.
				<a href="/cookie-policy">Cookie Policy</a>
			</p>
			<div class="cookie-actions">
				<button class="btn-accept" onclick={accept}>Accept All</button>
				<button class="btn-decline" onclick={decline}>Decline</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		background: var(--color-primary);
		color: #fff;
		padding: var(--space-3) var(--space-2);
		font-family: var(--font-body);
		animation: slideUp 0.4s ease-out;
	}

	.cookie-banner.dismissed {
		animation: slideDown 0.4s ease-in forwards;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes slideDown {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(100%);
		}
	}

	.cookie-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.cookie-text {
		margin: 0;
		font-size: var(--text-small);
		line-height: 1.5;
		flex: 1;
	}

	.cookie-text a {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.cookie-text a:hover {
		opacity: 0.85;
	}

	.cookie-actions {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.btn-accept,
	.btn-decline {
		font-family: var(--font-body);
		font-size: var(--text-small);
		font-weight: 600;
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		white-space: nowrap;
		transition: opacity 0.2s;
	}

	.btn-accept {
		background: var(--color-accent);
		color: #fff;
		border: none;
	}

	.btn-accept:hover {
		opacity: 0.9;
	}

	.btn-decline {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.4);
	}

	.btn-decline:hover {
		border-color: rgba(255, 255, 255, 0.7);
	}

	.btn-accept:focus-visible,
	.btn-decline:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		.cookie-inner {
			flex-direction: column;
			text-align: center;
		}

		.cookie-actions {
			width: 100%;
		}

		.btn-accept,
		.btn-decline {
			flex: 1;
		}
	}
</style>
