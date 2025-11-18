# Auth0 Configuration Checklist

Use this checklist to ensure your Auth0 account is properly configured for this application.

## ☐ Step 1: Create Regular Web Application

1. ☐ Log in to [Auth0 Dashboard](https://manage.auth0.com/)
2. ☐ Go to **Applications** → **Applications**
3. ☐ Click **Create Application**
4. ☐ Name: "Auth0 Multi-Tenant POC" (or your preferred name)
5. ☐ Type: Select **Regular Web Applications**
6. ☐ Click **Create**

### Configure Application Settings
7. ☐ Go to **Settings** tab
8. ☐ Copy **Domain** → Add to `.env` as `AUTH0_DOMAIN`
9. ☐ Copy **Client ID** → Add to `.env` as `AUTH0_CLIENT_ID`
10. ☐ Copy **Client Secret** → Add to `.env` as `AUTH0_CLIENT_SECRET`
11. ☐ Set **Allowed Callback URLs**: `http://localhost:5173/api/auth/callback`
12. ☐ Set **Allowed Logout URLs**: `http://localhost:5173`
13. ☐ Set **Allowed Web Origins**: `http://localhost:5173`
14. ☐ Click **Save Changes**

## ☐ Step 2: Set Up Organizations (Critical for Auto-Detection)

Organizations are the foundation of multi-tenancy. Auth0 will automatically route users to the correct organization based on email domain configuration.

### Create Each Organization:
1. ☐ Go to **Organizations** in the Auth0 Dashboard
2. ☐ Click **Create Organization**
3. ☐ Enter **Organization Name** (e.g., "company-one") - used in URLs, lowercase recommended
4. ☐ Enter **Display Name** (e.g., "Company One") - shown to users
5. ☐ Click **Create**
6. ☐ Copy **Organization ID** (starts with `org_`) - you'll need this for testing

### Configure Email Domains (Required for Auto-Detection):
7. ☐ Go to organization's **Settings** tab
8. ☐ Scroll to **Email Domains** section
9. ☐ Click **Add Domain**
10. ☐ Enter the email domain (e.g., `company1.com`) - **without** the @ symbol
11. ☐ Click **Save**
12. ☐ Repeat for additional domains this organization uses

**✨ This is the magic!** When users log in with `user@company1.com`, Auth0 automatically knows they belong to this organization. No code changes needed!

### Configure Organization Connections:
13. ☐ Go to organization's **Connections** tab
14. ☐ Click **Enable Connections**
15. ☐ Select the Identity Provider(s) this organization should use (Google, Microsoft, etc.)
16. ☐ Click **Enable**
17. ☐ Only enabled connections will be available for this organization's users

### Enable Auto-Membership (Optional but Recommended):
18. ☐ Go to organization's **Settings** tab
19. ☐ Enable **Auto-membership** toggle
20. ☐ This automatically adds users with matching email domains to the organization
21. ☐ Users won't need an invitation - they're added on first login

### Repeat for Additional Organizations:
22. ☐ Create Organization 2 with its email domains and connections
23. ☐ Create Organization 3 with its email domains and connections
24. ☐ Each organization can have different IDPs and settings

## ☐ Step 3: Configure Identity Providers

Identity Providers (IDPs) are the authentication sources (Google, Microsoft, etc.). Auth0 will automatically route users to the correct IDP based on which connections are enabled for their organization.

### For Google OAuth:
1. ☐ Go to **Authentication** → **Social**
2. ☐ Click **Create Connection** (or use existing if already created)
3. ☐ Select **Google**
4. ☐ Enter your Google OAuth credentials (or use Auth0's dev keys for testing)
5. ☐ Enable **Email** and **Profile** scopes
6. ☐ Click **Create**
7. ☐ Note the connection name (typically "google-oauth2")

### For Microsoft OAuth:
1. ☐ Go to **Authentication** → **Social**
2. ☐ Click **Create Connection**
3. ☐ Select **Microsoft**
4. ☐ Configure Azure AD settings (or use dev keys)
5. ☐ Click **Create**
6. ☐ Note the connection name (typically "windowslive")

### For Other IDPs:
☐ Repeat similar steps for Okta, SAML, GitHub, LinkedIn, etc.

### Important Notes:
- ✅ **No code mapping needed!** Auth0 auto-detects the IDP based on organization connections
- ✅ Each organization can have different IDPs enabled
- ✅ If an organization has multiple IDPs enabled, Auth0 will show a login page for users to choose
- ℹ️ (Optional) You can add explicit IDP mappings in `src/lib/config/auth0.ts` if needed for special cases

## ☐ Step 4: Create Management API Application

1. ☐ Go to **Applications** → **APIs**
2. ☐ Click **Auth0 Management API**
3. ☐ Go to **Machine to Machine Applications** tab

### Option A: Authorize Existing Application
4a. ☐ Find your Regular Web Application
5a. ☐ Toggle **Authorized** to ON
6a. ☐ Click **▼** to expand scopes
7a. ☐ Select these scopes:
   - ☐ `read:organizations`
   - ☐ `read:organization_members`
   - ☐ `create:organization_invitations`
   - ☐ `read:users`
8a. ☐ Click **Update**
9a. ☐ Use same Client ID and Secret as Step 1

### Option B: Create New M2M Application
4b. ☐ Click **Create Machine to Machine Application**
5b. ☐ Name: "Auth0 Management API Client"
6b. ☐ Select **Auth0 Management API**
7b. ☐ Select the same scopes as above
8b. ☐ Click **Create**
9b. ☐ Copy **Client ID** → Add to `.env` as `AUTH0_MANAGEMENT_API_CLIENT_ID`
10b. ☐ Copy **Client Secret** → Add to `.env` as `AUTH0_MANAGEMENT_API_CLIENT_SECRET`

## ☐ Step 5: Add Test Users to Organizations

1. ☐ Go to **User Management** → **Users**
2. ☐ Create or select a test user
3. ☐ Go to user's **Organizations** tab
4. ☐ Click **Assign to Organization**
5. ☐ Select an organization
6. ☐ Click **Assign**
7. ☐ Repeat for additional test users

## ☐ Step 6: Configure Email Domain Mappings

1. ☐ Open `src/lib/config/auth0.ts`
2. ☐ Update `emailDomainToConnection`:
   ```typescript
   export const emailDomainToConnection: Record<string, string> = {
     'yourcompany.com': 'google-oauth2',     // ☐ Replace with your domain
     'example.com': 'microsoft',             // ☐ Add more as needed
   };
   ```

3. ☐ Update `emailDomainToOrganization`:
   ```typescript
   export const emailDomainToOrganization: Record<string, string> = {
     'yourcompany.com': 'org_xxxxxxxxxxxxx', // ☐ Use actual Org IDs from Step 2
     'example.com': 'org_yyyyyyyyyyyyyyy',   // ☐ Add more as needed
   };
   ```

## ☐ Step 7: Configure Environment Variables

1. ☐ Copy `.env.example` to `.env`
2. ☐ Fill in all values from previous steps:
   - ☐ `AUTH0_DOMAIN`
   - ☐ `AUTH0_CLIENT_ID`
   - ☐ `AUTH0_CLIENT_SECRET`
   - ☐ `AUTH0_CALLBACK_URL`
   - ☐ `AUTH0_LOGOUT_URL`
   - ☐ `AUTH0_AUDIENCE` (optional)
   - ☐ `AUTH0_MANAGEMENT_API_CLIENT_ID`
   - ☐ `AUTH0_MANAGEMENT_API_CLIENT_SECRET`
   - ☐ `PUBLIC_AUTH0_DOMAIN`
   - ☐ `PUBLIC_AUTH0_CLIENT_ID`
   - ☐ `PUBLIC_AUTH0_CALLBACK_URL`
   - ☐ `SESSION_SECRET` (generate a random string)

## ☐ Step 8: Verify Configuration

### In Auth0 Dashboard:
☐ Application exists with correct callback URLs  
☐ At least one organization exists  
☐ At least one IDP connection configured  
☐ At least one test user assigned to an organization  
☐ Management API authorized with correct scopes  

### In Code:
☐ `.env` file created with all variables  
☐ Domain mappings updated in `auth0.ts`  
☐ Email domains match your test users  
☐ Organization IDs are correct  

## ☐ Step 9: Test the Application

1. ☐ Run `pnpm install`
2. ☐ Run `pnpm run dev`
3. ☐ Visit `http://localhost:5173`
4. ☐ Enter a test user email
5. ☐ Verify redirect to correct IDP
6. ☐ Complete authentication
7. ☐ Verify landing on dashboard
8. ☐ Check user info displays correctly
9. ☐ Verify organizations list shows
10. ☐ Test invitation feature

## Troubleshooting

### If login fails:
- ☐ Check callback URL matches exactly (no trailing slashes)
- ☐ Verify Auth0 credentials in `.env`
- ☐ Check browser console for errors
- ☐ Review Auth0 logs in dashboard

### If organizations don't show:
- ☐ Verify user is assigned to organizations in Auth0
- ☐ Check Management API credentials
- ☐ Verify Management API scopes
- ☐ Check terminal/console for API errors

### If IDP selection doesn't work:
- ☐ Verify email domain mappings in `auth0.ts`
- ☐ Check connection names match exactly
- ☐ Ensure connections are enabled for organizations

## Next Steps

After successful testing:
☐ Configure production Auth0 tenant  
☐ Update callback URLs for production  
☐ Generate secure session secret  
☐ Enable HTTPS  
☐ Review security settings  
☐ Set up monitoring  
☐ Deploy to production  

---

**Need Help?**
- Check `SETUP.md` for quick start guide
- Review `README.md` for detailed documentation
- Consult [Auth0 Documentation](https://auth0.com/docs)
