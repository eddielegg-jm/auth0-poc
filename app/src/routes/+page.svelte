<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	function handleRetry() {
		// Redirect back to Auth0 login
		window.location.href = '/api/auth/login';
	}
</script>

<svelte:head>
	<title>Authentication Error - Auth0 Multi-Tenant POC</title>
</svelte:head>

<div class="container">
	<div class="login-card">
		<div class="header">
			<h1>Authentication Error</h1>
			<p>Something went wrong during sign in</p>
		</div>

		<div class="error-message">
			{#if data.error === 'invalid_state'}
				Invalid request. Please try again.
			{:else if data.error === 'token_exchange_failed'}
				Authentication failed. Please try again.
			{:else if data.error === 'authentication_failed'}
				Authentication failed. Please contact support.
			{:else}
				{data.error}
			{/if}
		</div>

		<div class="form">
			<button on:click={handleRetry} class="login-btn">
				Try Again
			</button>
		</div>

		<div class="info">
			<p>
				If this problem persists, please contact your system administrator.
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

	.login-btn {
		padding: 16px 32px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 18px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.login-btn:hover {
		background: #5568d3;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
	}

	.login-btn:active {
		transform: translateY(0);
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
