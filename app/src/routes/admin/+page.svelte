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
	<title>Admin Console - Auth0 Multi-Tenant POC</title>
</svelte:head>

<div class="admin">
	<nav class="navbar">
		<div class="nav-content">
			<h2>Admin Console</h2>
			<div class="nav-links">
				<a href="/dashboard">Dashboard</a>
				<button on:click={handleLogout} class="logout-btn">Sign Out</button>
			</div>
		</div>
	</nav>

	<div class="container">
		<div class="header-section">
			<h1>👑 Admin Console</h1>
			<p>You have administrative access to manage the following organizations</p>
		</div>

		<div class="admin-grid">
			<!-- User Roles Card -->
			<div class="card">
				<h3>Your Roles</h3>
				<div class="roles-list">
					{#if data.userRoles.length === 0}
						<p class="empty-state">No roles assigned yet</p>
					{:else}
						{#each data.userRoles as role}
							<div class="role-item">
								<span class="role-badge role-{role.role}">{role.role}</span>
								<span class="org-name">
									{data.organizations.find(o => o.id === role.organizationId)?.display_name || role.organizationId}
								</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Organizations Card -->
			<div class="card">
				<h3>Managed Organizations</h3>
				<div class="org-list">
					{#each data.organizations as org}
						<div class="org-item">
							{#if org.branding?.logo_url}
								<img src={org.branding.logo_url} alt={org.display_name} class="org-logo" />
							{:else}
								<div class="org-logo-placeholder">
									{org.display_name?.charAt(0) || 'O'}
								</div>
							{/if}
							<div class="org-info">
								<strong>{org.display_name}</strong>
								<span class="org-id">{org.id}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- RBAC Info Card -->
			<div class="card info-card">
				<h3>📋 RBAC Information</h3>
				<p>Role-Based Access Control (RBAC) in this application is managed at the application level, not in Auth0.</p>
				<ul>
					<li><span class="role-badge role-admin">Admin</span> - Full access to all features</li>
					<li><span class="role-badge role-user">User</span> - Can invite users and access dashboard</li>
					<li><span class="role-badge role-viewer">Viewer</span> - Read-only access</li>
				</ul>
				<p class="note">
					Note: Roles are currently hardcoded in <code>src/lib/rbac/roles.ts</code> for POC purposes.
					In production, these would be stored in a database.
				</p>
			</div>

			<!-- Quick Actions Card -->
			<div class="card">
				<h3>Quick Actions</h3>
				<div class="actions">
					<a href="/dashboard" class="action-btn">
						<span>📊</span>
						<div>
							<strong>Go to Dashboard</strong>
							<p>View user information and organizations</p>
						</div>
					</a>
					<a href="/internal-app-1" class="action-btn">
						<span>🔐</span>
						<div>
							<strong>Internal App 1</strong>
							<p>SSO to first internal application</p>
						</div>
					</a>
					<a href="/internal-app-2" class="action-btn">
						<span>🔐</span>
						<div>
							<strong>Internal App 2</strong>
							<p>SSO to second internal application</p>
						</div>
					</a>
				</div>
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

	.admin {
		min-height: 100vh;
	}

	.navbar {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

	.header-section {
		margin-bottom: 32px;
	}

	.header-section h1 {
		margin: 0 0 8px 0;
		font-size: 36px;
		color: #1a1a1a;
	}

	.header-section p {
		margin: 0;
		color: #666;
		font-size: 16px;
	}

	.admin-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.card h3 {
		margin: 0 0 20px 0;
		font-size: 18px;
		color: #1a1a1a;
	}

	.roles-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.role-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px;
		background: #f5f7fa;
		border-radius: 8px;
	}

	.role-badge {
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.role-admin {
		background: #fee;
		color: #c33;
	}

	.role-user {
		background: #e7f3ff;
		color: #0066cc;
	}

	.role-viewer {
		background: #f0f0f0;
		color: #666;
	}

	.org-name {
		color: #666;
		font-size: 14px;
	}

	.org-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.org-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px;
		background: #f5f7fa;
		border-radius: 8px;
	}

	.org-logo,
	.org-logo-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.org-logo-placeholder {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: 600;
	}

	.org-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.org-id {
		font-size: 12px;
		color: #999;
		font-family: monospace;
	}

	.info-card {
		grid-column: span 2;
	}

	.info-card ul {
		margin: 16px 0;
		padding-left: 20px;
	}

	.info-card li {
		margin: 8px 0;
		color: #666;
	}

	.note {
		margin-top: 16px;
		padding: 12px;
		background: #fff3cd;
		border-left: 4px solid #ffc107;
		border-radius: 4px;
		font-size: 14px;
		color: #856404;
	}

	code {
		background: #f5f5f5;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 13px;
	}

	.empty-state {
		text-align: center;
		color: #999;
		padding: 20px;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: #f5f7fa;
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: #e9ecef;
		transform: translateX(4px);
	}

	.action-btn span {
		font-size: 24px;
	}

	.action-btn strong {
		display: block;
		color: #1a1a1a;
		margin-bottom: 4px;
	}

	.action-btn p {
		margin: 0;
		color: #666;
		font-size: 13px;
	}

	@media (max-width: 768px) {
		.admin-grid {
			grid-template-columns: 1fr;
		}

		.info-card {
			grid-column: span 1;
		}
	}
</style>
