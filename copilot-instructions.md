# Prompt: Build a SvelteKit POC Demonstrating Auth0 Multi-Tenant SSO Architecture

**Goal:**  
Build a SvelteKit web application that POCs a multi-tenant authentication system using Auth0, Organizations, domain-based IdP routing, and SSO into internal applications. The app acts as both an admin console and a launchpad to authenticated internal apps. RBAC lives in the app, not Auth0.

---

## 🔐 Authentication Requirements

1. Auth0 handles 100% of authentication using OIDC.
2. Auth0 Organizations represent tenants.
3. Tenant identification is automatic, ideally based on:
   - Email domain (e.g., `@companyA.com` → Org “companyA”), AND/OR
   - Custom Auth0 login domains (`tenantA.auth.example.com` → Org A)
4. The app must not need to include the organization ID explicitly when redirecting to Auth0, if custom domains are used.
5. The login flow must support federated IdPs (Entra ID, Okta, Google Workspace).

---

## 🌐 IdP Routing Requirements

- Each tenant has one or more IdPs, configured per Organization in Auth0.
- No per-tenant code conditions (no `if domain === "x"` logic in the app).
- Automatic IdP selection should be handled by Organizations or Auth0 Actions.
- The app should demonstrate how tenants can be onboarded without code changes.

---

## 👥 User Onboarding Requirements

- The Core App will call Auth0 Management API to:
  - Create users
  - Assign them to an Organization
  - Trigger the first-time login email/password-reset email
- Users should be able to sign in with:
  - Their tenant’s federated IdP (e.g., Entra ID)
  - The Auth0 universal login page
- The app's UI should include a very simple invite UI:
  - Text field for email
  - Dropdown for selecting tenant (Organization)
  - Button to send invite using Auth0 Management API

---

## 🔑 RBAC Requirements

- RBAC is **not** handled by Auth0.
- The app must:
  - Store its own roles (hardcoded or simple data file is fine for POC)
  - Fetch and display roles after login
  - Use roles to control access to an admin page
- Auth0 tokens do not need custom claims for roles.

---

## 🔁 SSO Requirements

- SSO session is managed by Auth0 only.
- Internal applications should be simulated:
  - One or two simple Svelte “internal apps” living under different routes
  - Each is its own OIDC client in Auth0
  - When navigating from the core app to an internal app, user should be silently logged in (SSO)
- Logout from core app must:
  - Clear Auth0 session
  - Log out user from internal apps

---

## 📁 App Structure Requirements

Build a minimal SvelteKit project with:

src/
routes/
+page.svelte # Landing page with login button
dashboard/+page.svelte # After-login home page
admin/+page.svelte # RBAC-protected admin console
internal-app-1/+page.svelte # Example internal application
internal-app-2/+page.svelte # Second internal application
lib/
auth/
auth0.ts # Auth0 OIDC client config
session.ts # Reads Auth0 session token / user info
rbac/
roles.ts # Simple RBAC logic for POC
api/
inviteUser.ts # Auth0 Management API wrapper

markdown
Copy code

The generated SvelteKit app should:

- Use Auth0 SPA/OIDC best practices (PKCE required).
- Store session using SvelteKit’s `handle()` hook.
- Protect routes using SvelteKit’s `load()` guards.
- Demonstrate redirecting to Auth0 using a custom domain per org.
- Demonstrate SSO by redirecting to internal apps.

---

## 📚 Documentation Requirements

Have the agent generate:

1. A **README** explaining:
   - How to configure Auth0 Organizations
   - How to set up custom login domains for each org
   - How to register the internal apps as OIDC applications
   - How to configure Actions for email-domain-based routing (if used)
   - How to configure the Management API
2. A **Getting Started** guide:
   - How to start local SvelteKit app
   - Environment variables required
   - How to simulate SSO between apps
3. A tenant onboarding checklist:
   - Create Organization
   - Add domains
   - Assign configured IdP(s)
   - Create internal-app clients

---

## 🎯 Acceptance Criteria

The agent should produce:

- A working SvelteKit project
- Configurable Auth0 OIDC integration
- Multi-tenant login via Organizations
- Automatic IdP selection through Organizations or Actions
- SSO into at least one internal app
- Invite flow that interacts with Auth0 Management API
- Simple RBAC in Core App
- Logout clearing Auth0 session