<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let email = '';
	let loading = false;
	let error = data.error || '';

	async function handleLogin() {
		if (!email) {
			error = 'Please enter your email address';
			return;
		}

		// Simple email validation
		if (!email.includes('@')) {
			error = 'Please enter a valid email address';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (response.ok && data.authorizationUrl) {
				// Redirect to Auth0
				window.location.href = data.authorizationUrl;
			} else {
				error = data.error || 'Failed to initiate login';
				loading = false;
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			loading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - Auth0 Multi-Tenant POC</title>
</svelte:head>

<div class="container">
	<div class="login-card">
		<div class="header">
			<h1>Welcome</h1>
			<p>Sign in to your organization</p>
		</div>

		{#if error}
			<div class="error-message">
				{#if error === 'invalid_state'}
					Invalid request. Please try again.
				{:else if error === 'token_exchange_failed'}
					Authentication failed. Please try again.
				{:else if error === 'authentication_failed'}
					Authentication failed. Please contact support.
				{:else}
					{error}
				{/if}
			</div>
		{/if}

		<div class="form">
			<label for="email">Email Address</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				on:keypress={handleKeyPress}
				placeholder="you@company.com"
				disabled={loading}
				autocomplete="email"
			/>

			<button on:click={handleLogin} disabled={loading}>
				{#if loading}
					Signing in...
				{:else}
					Sign In
				{/if}
			</button>
		</div>

		<div class="info">
			<p>
				Your organization's identity provider will be automatically detected based on your email
				domain.
			</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 20px;
	}

	.login-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		padding: 48px;
		width: 100%;
		max-width: 440px;
	}

	.header {
		text-align: center;
		margin-bottom: 32px;
	}

	.header h1 {
		margin: 0 0 8px 0;
		font-size: 32px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.header p {
		margin: 0;
		font-size: 16px;
		color: #666;
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 6px;
		padding: 12px 16px;
		margin-bottom: 24px;
		color: #c33;
		font-size: 14px;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	label {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	input {
		padding: 12px 16px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	button {
		padding: 12px 24px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
		margin-top: 8px;
	}

	button:hover:not(:disabled) {
		background: #5568d3;
	}

	button:disabled {
		background: #aaa;
		cursor: not-allowed;
	}

	.info {
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid #eee;
	}

	.info p {
		margin: 0;
		font-size: 13px;
		color: #666;
		text-align: center;
		line-height: 1.5;
	}
</style>
