<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let showInviteModal = false;
	let selectedOrgId = '';
	let inviteEmail = '';
	let inviteLoading = false;
	let inviteError = '';
	let inviteSuccess = '';
	let selectingOrg = false;

	function openInviteModal(orgId: string) {
		selectedOrgId = orgId;
		showInviteModal = true;
		inviteEmail = '';
		inviteError = '';
		inviteSuccess = '';
	}

	function closeInviteModal() {
		showInviteModal = false;
		selectedOrgId = '';
		inviteEmail = '';
		inviteError = '';
		inviteSuccess = '';
	}

	async function handleInvite() {
		if (!inviteEmail) {
			inviteError = 'Please enter an email address';
			return;
		}

		if (!inviteEmail.includes('@')) {
			inviteError = 'Please enter a valid email address';
			return;
		}

		inviteLoading = true;
		inviteError = '';
		inviteSuccess = '';

		try {
			const response = await fetch('/api/invite', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: inviteEmail,
					organizationId: selectedOrgId
				})
			});

			const result = await response.json();

			if (response.ok) {
				inviteSuccess = 'Invitation sent successfully!';
				setTimeout(() => {
					closeInviteModal();
				}, 2000);
			} else {
				inviteError = result.error || 'Failed to send invitation';
			}
		} catch (err) {
			inviteError = 'An error occurred. Please try again.';
		} finally {
			inviteLoading = false;
		}
	}

	async function handleSelectOrganization(orgId: string) {
		selectingOrg = true;

		try {
			const response = await fetch('/api/select-organization', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ organizationId: orgId })
			});

			if (response.ok) {
				// Refresh page to load with organization context
				goto('/dashboard', { invalidateAll: true });
			} else {
				const result = await response.json();
				alert(result.error || 'Failed to select organization');
				selectingOrg = false;
			}
		} catch (err) {
			console.error('Error selecting organization:', err);
			alert('An error occurred. Please try again.');
			selectingOrg = false;
		}
	}

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST'
			});

			const data = await response.json();

			if (data.logoutUrl) {
				window.location.href = data.logoutUrl;
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
	<title>Dashboard - Auth0 Multi-Tenant POC</title>
</svelte:head>

<div class="dashboard">
	<nav class="navbar">
		<div class="nav-content">
			<h2>Auth0 Multi-Tenant POC</h2>
			<button on:click={handleLogout} class="logout-btn">Sign Out</button>
		</div>
	</nav>

	<div class="container">
		{#if data.requiresOrgSelection}
			<!-- Organization Selection UI -->
			<div class="org-selection-container">
				<div class="org-selection-card">
					<h1>Select Your Organization</h1>
					<p class="subtitle">You belong to multiple organizations. Please select one to continue.</p>

					<div class="org-selection-list">
						{#each data.organizations as org}
							<button
								class="org-selection-item"
								on:click={() => handleSelectOrganization(org.id)}
								disabled={selectingOrg}
							>
								{#if org.branding?.logo_url}
									<img src={org.branding.logo_url} alt={org.display_name} class="org-logo" />
								{:else}
									<div class="org-logo-placeholder">
										{org.display_name?.charAt(0) || 'O'}
									</div>
								{/if}
								<div class="org-selection-info">
									<h3>{org.display_name}</h3>
									<p>@{org.name}</p>
								</div>
								<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
								</svg>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<!-- Normal Dashboard UI -->
			<div class="user-section">
				<div class="user-card">
					{#if data.user.picture}
						<img src={data.user.picture} alt={data.user.name} class="avatar" />
					{:else}
						<div class="avatar-placeholder">
							{data.user.name?.charAt(0) || 'U'}
						</div>
					{/if}
					<div class="user-info">
						<h1>{data.user.name}</h1>
						<p class="email">{data.user.email}</p>
						<p class="user-id">ID: {data.user.sub}</p>
						{#if data.user.org_name}
							<p class="org-badge">
								<span class="badge">{data.user.org_name}</span>
							</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Internal Apps Section -->
			<div class="internal-apps-section">
				<h2>🚀 Test SSO with Internal Apps</h2>
				<p class="section-subtitle">
					Click these links to test Single Sign-On. You'll be automatically authenticated without re-entering credentials.
				</p>
				
				<div class="apps-grid">
					<a href="/internal-app-1" class="app-card">
						<div class="app-icon">📊</div>
						<div class="app-content">
							<h3>CRM System</h3>
							<p>Customer Relationship Management</p>
							<div class="app-badge">
								<span class="badge-dot"></span>
								SSO Protected
							</div>
						</div>
						<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</a>

					<a href="/internal-app-2" class="app-card">
						<div class="app-icon">📈</div>
						<div class="app-content">
							<h3>Analytics Platform</h3>
							<p>Business Intelligence & Reports</p>
							<div class="app-badge">
								<span class="badge-dot"></span>
								SSO Protected
							</div>
						</div>
						<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</a>
				</div>

				<div class="app-card production-app">
					<a href="https://auth0-poc-internal.vercel.app/" class="app-link">
						<div class="app-icon">🏢</div>
						<div class="app-details">
							<h3>Production Internal App</h3>
							<p>Single-tenant app scoped to your organization</p>
							<div class="app-badge production">
								<span class="badge-dot"></span>
								Organization Scoped
							</div>
						</div>
						<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</a>
				</div>

				<div class="sso-info">
					<div class="info-icon">💡</div>
					<div>
						<strong>How SSO Works:</strong>
						<p>When you click these links, Auth0 will check your existing session and automatically log you in without prompting for credentials. The production app is restricted to organization <code>org_v5DsB07TH5m7Icci</code> only.</p>
					</div>
				</div>
			</div>

			<div class="organizations-section">
				<h2>Your Organizations</h2>

			{#if data.organizations.length === 0}
				<div class="empty-state">
					<p>You are not a member of any organizations yet.</p>
				</div>
			{:else}
				<div class="org-grid">
					{#each data.organizations as org}
						<div class="org-card">
							<div class="org-header">
								{#if org.branding?.logo_url}
									<img src={org.branding.logo_url} alt={org.display_name} class="org-logo" />
								{:else}
									<div class="org-logo-placeholder">
										{org.display_name?.charAt(0) || 'O'}
									</div>
								{/if}
								<div>
									<h3>{org.display_name}</h3>
									<p class="org-name">@{org.name}</p>
								</div>
							</div>

							<div class="org-details">
								<div class="detail-item">
									<span class="label">Organization ID</span>
									<span class="value">{org.id}</span>
								</div>
								<div class="detail-item">
									<span class="label">Members</span>
									<span class="value">{org.memberCount}</span>
								</div>
							</div>

							<div class="org-actions">
								<button on:click={() => openInviteModal(org.id)} class="invite-btn">
									Invite Member
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		{/if}
	</div>
</div>

{#if showInviteModal}
	<div class="modal-backdrop" on:click={closeInviteModal} role="button" tabindex="0">
		<div class="modal" on:click|stopPropagation role="dialog" tabindex="-1">
			<div class="modal-header">
				<h3>Invite User to Organization</h3>
				<button on:click={closeInviteModal} class="close-btn">&times;</button>
			</div>

			<div class="modal-body">
				{#if inviteSuccess}
					<div class="success-message">{inviteSuccess}</div>
				{/if}

				{#if inviteError}
					<div class="error-message">{inviteError}</div>
				{/if}

				<label for="invite-email">Email Address</label>
				<input
					id="invite-email"
					type="email"
					bind:value={inviteEmail}
					placeholder="user@company.com"
					disabled={inviteLoading}
				/>
			</div>

			<div class="modal-footer">
				<button on:click={closeInviteModal} class="cancel-btn" disabled={inviteLoading}>
					Cancel
				</button>
				<button on:click={handleInvite} class="submit-btn" disabled={inviteLoading}>
					{#if inviteLoading}
						Sending...
					{:else}
						Send Invitation
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		background: #f5f7fa;
	}

	.dashboard {
		min-height: 100vh;
	}

	.navbar {
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 16px 0;
		margin-bottom: 32px;
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
		color: #1a1a1a;
	}

	.logout-btn {
		padding: 8px 16px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.logout-btn:hover {
		background: #5568d3;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px 48px;
	}

	.user-section {
		margin-bottom: 48px;
	}

	.user-card {
		background: white;
		border-radius: 12px;
		padding: 32px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.avatar,
	.avatar-placeholder {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		background: #667eea;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32px;
		font-weight: 600;
	}

	.user-info h1 {
		margin: 0 0 8px 0;
		font-size: 28px;
		color: #1a1a1a;
	}

	.email {
		margin: 0 0 8px 0;
		color: #666;
		font-size: 16px;
	}

	.user-id {
		margin: 0;
		color: #999;
		font-size: 13px;
		font-family: monospace;
	}

	/* Internal Apps Section */
	.internal-apps-section {
		margin-bottom: 48px;
	}

	.internal-apps-section h2 {
		margin: 0 0 8px 0;
		font-size: 24px;
		color: #1a1a1a;
	}

	.section-subtitle {
		margin: 0 0 24px 0;
		color: #666;
		font-size: 15px;
	}

	.apps-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 24px;
	}

	.app-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 16px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		border: 2px solid transparent;
	}

	.app-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		border-color: #667eea;
	}

	.app-icon {
		font-size: 48px;
		flex-shrink: 0;
	}

	.app-content {
		flex: 1;
	}

	.app-content h3 {
		margin: 0 0 4px 0;
		font-size: 18px;
		color: #1a1a1a;
	}

	.app-content p {
		margin: 0 0 8px 0;
		color: #666;
		font-size: 14px;
	}

	.app-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: #e8f5e9;
		color: #2e7d32;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #4caf50;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.arrow-icon {
		width: 24px;
		height: 24px;
		color: #999;
		flex-shrink: 0;
		transition: transform 0.2s, color 0.2s;
	}

	.app-card:hover .arrow-icon {
		transform: translateX(4px);
		color: #667eea;
	}

	.app-card.production-app {
		border: 2px solid #764ba2;
		background: linear-gradient(135deg, #fef5ff 0%, #f3e5ff 100%);
	}

	.app-card.production-app:hover {
		box-shadow: 0 8px 24px rgba(118, 75, 162, 0.25);
		border-color: #667eea;
	}

	.app-badge.production {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
	}

	.sso-info {
		background: linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		gap: 16px;
		border-left: 4px solid #2196f3;
	}

	.sso-info code {
		background: white;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 13px;
		color: #d32f2f;
	}

	.info-icon {
		font-size: 24px;
		flex-shrink: 0;
	}

	.sso-info strong {
		display: block;
		color: #1a1a1a;
		margin-bottom: 4px;
		font-size: 15px;
	}

	.sso-info p {
		margin: 0;
		color: #555;
		font-size: 14px;
		line-height: 1.5;
	}

	.organizations-section h2 {
		margin: 0 0 24px 0;
		font-size: 24px;
		color: #1a1a1a;
	}

	.empty-state {
		background: white;
		border-radius: 12px;
		padding: 48px;
		text-align: center;
		color: #666;
	}

	.org-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 24px;
	}

	.org-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.org-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.org-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
		padding-bottom: 20px;
		border-bottom: 1px solid #eee;
	}

	.org-logo,
	.org-logo-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		object-fit: cover;
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

	.org-header h3 {
		margin: 0 0 4px 0;
		font-size: 18px;
		color: #1a1a1a;
	}

	.org-name {
		margin: 0;
		color: #666;
		font-size: 14px;
	}

	.org-details {
		margin-bottom: 20px;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		font-size: 14px;
	}

	.label {
		color: #666;
	}

	.value {
		color: #1a1a1a;
		font-weight: 500;
		font-family: monospace;
	}

	.org-actions {
		display: flex;
		gap: 12px;
	}

	.invite-btn {
		flex: 1;
		padding: 10px 16px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.invite-btn:hover {
		background: #5568d3;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 480px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		padding: 24px 24px 16px;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 20px;
		color: #1a1a1a;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 32px;
		line-height: 1;
		color: #999;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
	}

	.close-btn:hover {
		color: #333;
	}

	.modal-body {
		padding: 24px;
	}

	.modal-body label {
		display: block;
		margin-bottom: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.modal-body input {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 16px;
		box-sizing: border-box;
	}

	.modal-body input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.success-message,
	.error-message {
		padding: 12px 16px;
		border-radius: 6px;
		margin-bottom: 16px;
		font-size: 14px;
	}

	.success-message {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		color: #c33;
	}

	.modal-footer {
		padding: 16px 24px 24px;
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.cancel-btn,
	.submit-btn {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.cancel-btn {
		background: #f5f5f5;
		color: #333;
	}

	.cancel-btn:hover:not(:disabled) {
		background: #e5e5e5;
	}

	.submit-btn {
		background: #667eea;
		color: white;
	}

	.submit-btn:hover:not(:disabled) {
		background: #5568d3;
	}

	.cancel-btn:disabled,
	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Organization Selection Styles */
	.org-selection-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 80px);
		padding: 40px 20px;
	}

	.org-selection-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		padding: 48px;
		width: 100%;
		max-width: 600px;
	}

	.org-selection-card h1 {
		margin: 0 0 8px 0;
		font-size: 28px;
		color: #1a1a1a;
		text-align: center;
	}

	.subtitle {
		margin: 0 0 32px 0;
		font-size: 16px;
		color: #666;
		text-align: center;
	}

	.org-selection-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.org-selection-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: white;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.org-selection-item:hover:not(:disabled) {
		border-color: #667eea;
		background: #f8f9ff;
	}

	.org-selection-item:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.org-selection-item .org-logo,
	.org-selection-item .org-logo-placeholder {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
	}

	.org-selection-info {
		flex: 1;
	}

	.org-selection-info h3 {
		margin: 0 0 4px 0;
		font-size: 18px;
		color: #1a1a1a;
	}

	.org-selection-info p {
		margin: 0;
		font-size: 14px;
		color: #666;
	}

	.arrow-icon {
		width: 24px;
		height: 24px;
		color: #999;
		flex-shrink: 0;
	}

	.org-selection-item:hover:not(:disabled) .arrow-icon {
		color: #667eea;
	}

	.org-badge {
		margin-top: 8px;
	}

	.badge {
		display: inline-block;
		padding: 4px 12px;
		background: #667eea;
		color: white;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}
</style>
