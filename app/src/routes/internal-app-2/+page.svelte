<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST'
			});

			const result = await response.json();

			if (result.logoutUrl) {
				window.location.href = result.logoutUrl;
			} else {
				window.location.href = '/';
			}
		} catch (err) {
			console.error('Logout error:', err);
			window.location.href = '/';
		}
	}
</script>

<svelte:head>
	<title>Internal App 2 - Analytics Platform</title>
</svelte:head>

<div class="internal-app">
	<nav class="navbar">
		<div class="nav-content">
			<div class="app-title">
				<span class="app-icon">📈</span>
				<h2>Analytics Platform</h2>
			</div>
			<div class="nav-links">
				<a href="/dashboard">Main App</a>
				<a href="/internal-app-1">CRM</a>
				<button on:click={handleLogout} class="logout-btn">Sign Out</button>
			</div>
		</div>
	</nav>

	<div class="container">
		<div class="header">
			<h1>📊 Business Analytics</h1>
			<div class="sso-badge">
				<span>🔐</span>
				<div>
					<strong>Single Sign-On Active</strong>
					<p>You were automatically signed in via SSO</p>
				</div>
			</div>
		</div>

		<div class="content-grid">
			<div class="card welcome-card">
				<h3>Welcome, {data.user.name}!</h3>
				<p class="user-email">{data.user.email}</p>
				<p class="info">
					This is a simulated internal application (Internal App 2) demonstrating SSO functionality.
					You were automatically authenticated using your existing Auth0 session from the main application.
				</p>
			</div>

			<div class="card">
				<h3>SSO Demonstration</h3>
				<ul class="feature-list">
					<li>✅ No separate login required</li>
					<li>✅ Shared Auth0 session</li>
					<li>✅ Seamless user experience</li>
					<li>✅ Consistent across all internal apps</li>
				</ul>
			</div>

			<div class="card">
				<h3>Simulated Analytics Features</h3>
				<div class="feature-grid">
					<div class="feature">
						<span>📊</span>
						<strong>Dashboards</strong>
					</div>
					<div class="feature">
						<span>📈</span>
						<strong>Reports</strong>
					</div>
					<div class="feature">
						<span>🔍</span>
						<strong>Data Explorer</strong>
					</div>
					<div class="feature">
						<span>⚡</span>
						<strong>Real-time Metrics</strong>
					</div>
				</div>
			</div>

			<div class="card info-card">
				<h3>🔐 SSO Architecture</h3>
				<p>
					This application demonstrates a multi-app SSO scenario in a production environment:
				</p>
				<ul>
					<li><strong>Main Application:</strong> Primary auth point with Auth0 Organizations</li>
					<li><strong>Internal App 1 (CRM):</strong> Separate OIDC client, SSO-enabled</li>
					<li><strong>Internal App 2 (Analytics):</strong> Another OIDC client, SSO-enabled</li>
				</ul>
				<p class="architecture-note">
					When properly configured in Auth0, users can navigate between these apps without 
					re-authentication. The Auth0 session cookie enables silent authentication using 
					the <code>prompt=none</code> parameter.
				</p>
			</div>

			<div class="card technical-card">
				<h3>🛠️ Technical Implementation</h3>
				<p>To implement this in production:</p>
				<ol>
					<li>Create separate Auth0 applications for each internal app</li>
					<li>Enable "Skip consent for verifiable first-party clients"</li>
					<li>Configure allowed callback URLs for each app</li>
					<li>Use <code>prompt=none</code> for silent authentication</li>
					<li>Handle <code>login_required</code> errors by redirecting to login</li>
					<li>Share session storage domain across apps (if same domain)</li>
				</ol>
			</div>

			<div class="card benefits-card">
				<h3>✨ Benefits of SSO</h3>
				<div class="benefits-grid">
					<div class="benefit">
						<span>👤</span>
						<strong>Better UX</strong>
						<p>Users don't need to log in multiple times</p>
					</div>
					<div class="benefit">
						<span>🔒</span>
						<strong>Enhanced Security</strong>
						<p>Centralized authentication reduces attack surface</p>
					</div>
					<div class="benefit">
						<span>⚙️</span>
						<strong>Easier Management</strong>
						<p>Manage access from one Auth0 dashboard</p>
					</div>
					<div class="benefit">
						<span>📱</span>
						<strong>Consistent Experience</strong>
						<p>Same auth flow across all applications</p>
					</div>
				</div>
			</div>
		</div>

		<div class="navigation-card">
			<h3>Navigate to Other Apps</h3>
			<div class="app-links">
				<a href="/dashboard" class="app-link">
					<span>🏠</span>
					<div>
						<strong>Main Dashboard</strong>
						<p>Return to main application</p>
					</div>
				</a>
				<a href="/internal-app-1" class="app-link">
					<span>📊</span>
					<div>
						<strong>CRM System</strong>
						<p>Internal App 1 - SSO enabled</p>
					</div>
				</a>
				<a href="/admin" class="app-link">
					<span>👑</span>
					<div>
						<strong>Admin Console</strong>
						<p>Administrative features</p>
					</div>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		background: #f5f7fa;
	}

	.internal-app {
		min-height: 100vh;
	}

	.navbar {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: white;
		padding: 16px 0;
		margin-bottom: 32px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.app-title {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.app-icon {
		font-size: 24px;
	}

	.nav-content h2 {
		margin: 0;
		font-size: 20px;
	}

	.nav-links {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.nav-links a {
		color: white;
		text-decoration: none;
		padding: 8px 16px;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.nav-links a:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.logout-btn {
		padding: 8px 16px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.logout-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px 48px;
	}

	.header {
		margin-bottom: 32px;
	}

	.header h1 {
		margin: 0 0 16px 0;
		font-size: 36px;
		color: #1a1a1a;
	}

	.sso-badge {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 16px 20px;
		background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
		border-radius: 8px;
		border: 2px solid #28a745;
	}

	.sso-badge span {
		font-size: 24px;
	}

	.sso-badge strong {
		display: block;
		color: #155724;
		margin-bottom: 4px;
	}

	.sso-badge p {
		margin: 0;
		color: #155724;
		font-size: 14px;
	}

	.content-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
		margin-bottom: 24px;
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.card h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		color: #1a1a1a;
	}

	.welcome-card {
		grid-column: span 2;
	}

	.user-email {
		color: #f5576c;
		font-weight: 500;
		margin-bottom: 16px;
	}

	.info {
		color: #666;
		line-height: 1.6;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.feature-list li {
		padding: 12px 0;
		border-bottom: 1px solid #eee;
		color: #666;
	}

	.feature-list li:last-child {
		border-bottom: none;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	.feature {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 20px;
		background: #f5f7fa;
		border-radius: 8px;
	}

	.feature span {
		font-size: 32px;
		margin-bottom: 8px;
	}

	.feature strong {
		color: #1a1a1a;
	}

	.info-card,
	.technical-card,
	.benefits-card {
		grid-column: span 2;
	}

	.info-card ul,
	.technical-card ol {
		margin: 16px 0;
		padding-left: 20px;
		color: #666;
	}

	.info-card li,
	.technical-card li {
		margin: 8px 0;
	}

	.architecture-note {
		margin-top: 16px;
		padding: 12px;
		background: #e7f3ff;
		border-left: 4px solid #2196f3;
		border-radius: 4px;
		font-size: 14px;
		color: #0d47a1;
	}

	.architecture-note code {
		background: rgba(0, 0, 0, 0.05);
		padding: 2px 6px;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		margin-top: 16px;
	}

	.benefit {
		padding: 20px;
		background: #f5f7fa;
		border-radius: 8px;
		text-align: center;
	}

	.benefit span {
		font-size: 32px;
		display: block;
		margin-bottom: 12px;
	}

	.benefit strong {
		display: block;
		color: #1a1a1a;
		margin-bottom: 8px;
	}

	.benefit p {
		margin: 0;
		color: #666;
		font-size: 14px;
		line-height: 1.4;
	}

	.navigation-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.navigation-card h3 {
		margin: 0 0 20px 0;
		font-size: 18px;
		color: #1a1a1a;
	}

	.app-links {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 16px;
	}

	.app-link {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: #f5f7fa;
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.app-link:hover {
		background: #e9ecef;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.app-link span {
		font-size: 32px;
	}

	.app-link strong {
		display: block;
		color: #1a1a1a;
		margin-bottom: 4px;
	}

	.app-link p {
		margin: 0;
		color: #666;
		font-size: 14px;
	}

	@media (max-width: 768px) {
		.content-grid {
			grid-template-columns: 1fr;
		}

		.welcome-card,
		.info-card,
		.technical-card,
		.benefits-card {
			grid-column: span 1;
		}

		.feature-grid,
		.benefits-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
