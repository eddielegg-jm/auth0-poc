# Vercel Deployment Guide

## Prerequisites

✅ Code pushed to GitHub: `eddielegg-jm/auth0-poc`  
✅ Vercel adapter configured in `svelte.config.js`  
✅ Auth0 application configured  

## Step 1: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign In** and authenticate with GitHub
3. Click **Add New** → **Project**
4. Find and select `eddielegg-jm/auth0-poc`
5. Configure:
   - **Framework Preset**: SvelteKit (auto-detected)
   - **Root Directory**: `app`
   - **Build Command**: `pnpm run build` (auto-detected)
   - **Output Directory**: `.svelte-kit` (auto-detected)
6. Click **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the app directory
cd /Users/eddie.legg/Code/auth0-poc/app
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? auth0-poc
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

## Step 2: Add Environment Variables in Vercel

After initial deployment:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development**:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `AUTH0_DOMAIN` | `dev-57ctxx7z8j5mdir1.us.auth0.com` | Your Auth0 tenant |
| `AUTH0_CLIENT_ID` | `EuJHc5oLY9zjntNQs6OAvSoUJDH5oh3F` | From Auth0 app |
| `AUTH0_CLIENT_SECRET` | `C0_t58AdO08ZWxd43KM2ap_AAk7oQLU6ebz1Ib4lAwM-e2suGTyOvJH0rO16ZHDa` | Keep secret! |
| `AUTH0_CALLBACK_URL` | `https://your-app.vercel.app/api/auth/callback` | Update after deployment |
| `AUTH0_LOGOUT_URL` | `https://your-app.vercel.app` | Update after deployment |
| `AUTH0_AUDIENCE` | `auth0-poc` | Your API identifier |
| `AUTH0_MANAGEMENT_API_CLIENT_ID` | (your value) | Management API client |
| `AUTH0_MANAGEMENT_API_CLIENT_SECRET` | (your value) | Management API secret |
| `PUBLIC_AUTH0_DOMAIN` | `dev-57ctxx7z8j5mdir1.us.auth0.com` | Public variable |
| `PUBLIC_AUTH0_CLIENT_ID` | `EuJHc5oLY9zjntNQs6OAvSoUJDH5oh3F` | Public variable |
| `PUBLIC_AUTH0_CALLBACK_URL` | `https://your-app.vercel.app/api/auth/callback` | Update after deployment |
| `SESSION_SECRET` | (generate strong random string) | Use: `openssl rand -base64 32` |

### Quick Add via CLI:

```bash
# Add environment variables one by one
vercel env add AUTH0_DOMAIN production
vercel env add AUTH0_CLIENT_ID production
vercel env add AUTH0_CLIENT_SECRET production
vercel env add AUTH0_CALLBACK_URL production
vercel env add AUTH0_LOGOUT_URL production
vercel env add AUTH0_AUDIENCE production
vercel env add AUTH0_MANAGEMENT_API_CLIENT_ID production
vercel env add AUTH0_MANAGEMENT_API_CLIENT_SECRET production
vercel env add PUBLIC_AUTH0_DOMAIN production
vercel env add PUBLIC_AUTH0_CLIENT_ID production
vercel env add PUBLIC_AUTH0_CALLBACK_URL production
vercel env add SESSION_SECRET production

# Then add for preview and development environments
```

## Step 3: Get Your Vercel URL

After deployment, Vercel will give you a URL like:
- **Production**: `https://auth0-poc.vercel.app`
- **Preview**: `https://auth0-poc-git-branch-name.vercel.app`

## Step 4: Update Auth0 Application Settings

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → **Applications**
3. Select your application
4. Update these settings:

### Allowed Callback URLs
Add (keep localhost for local dev):
```
http://localhost:5173/api/auth/callback,
https://auth0-poc.vercel.app/api/auth/callback,
https://auth0-poc-*.vercel.app/api/auth/callback
```

### Allowed Logout URLs
Add:
```
http://localhost:5173,
https://auth0-poc.vercel.app,
https://auth0-poc-*.vercel.app
```

### Allowed Web Origins
Add:
```
http://localhost:5173,
https://auth0-poc.vercel.app,
https://auth0-poc-*.vercel.app
```

4. Click **Save Changes**

## Step 5: Update Environment Variables with Production URL

1. Go back to Vercel → **Settings** → **Environment Variables**
2. Update these variables with your actual Vercel URL:
   - `AUTH0_CALLBACK_URL` → `https://auth0-poc.vercel.app/api/auth/callback`
   - `AUTH0_LOGOUT_URL` → `https://auth0-poc.vercel.app`
   - `PUBLIC_AUTH0_CALLBACK_URL` → `https://auth0-poc.vercel.app/api/auth/callback`
3. Click **Save**

## Step 6: Redeploy

After updating environment variables:

```bash
# Via CLI
vercel --prod

# Or via Dashboard
# Go to Deployments tab → Click "..." → Redeploy
```

## Step 7: Test Your Deployment

1. Visit `https://auth0-poc.vercel.app`
2. Try logging in with a test user
3. Verify the dashboard loads
4. Test invitation feature

## Automatic Deployments

Vercel automatically deploys:
- ✅ **Production**: Every push to `main` branch
- ✅ **Preview**: Every pull request and branch push
- ✅ **Instant rollback**: Click to rollback to previous deployment

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure `pnpm-lock.yaml` is committed

### Authentication fails
- Verify all environment variables are set correctly
- Check callback URLs match exactly (no trailing slashes)
- Review Auth0 logs for errors
- Ensure SESSION_SECRET is set

### "Module not found" errors
- Clear build cache: Settings → General → Clear build cache
- Redeploy

### Environment variables not working
- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding/changing variables

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update Auth0 callback URLs with custom domain

## Performance & Monitoring

Vercel provides:
- Real-time analytics
- Performance metrics
- Error tracking
- Function logs

Access via: **Analytics** and **Logs** tabs in your project

## Cost

Vercel Free Tier includes:
- ✅ Unlimited deployments
- ✅ HTTPS/SSL certificates
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions
- ✅ Preview deployments

Perfect for this POC! 🎉

## Next Steps

Once deployed:
- ✅ Share your Vercel URL: `https://auth0-poc.vercel.app`
- ✅ Test all authentication flows
- ✅ Verify organization features work
- ✅ Test invitation system
- ✅ Monitor for any errors in Vercel dashboard

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Open project in browser
vercel open
```

---

Need help? Check the [Vercel SvelteKit Docs](https://vercel.com/docs/frameworks/sveltekit)
