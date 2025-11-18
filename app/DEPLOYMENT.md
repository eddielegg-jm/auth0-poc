# Deployment Guide

## Local Development

Keep your actual credentials in `.env` (which is gitignored)

## GitHub Secrets Setup

### For GitHub Actions (CI/CD):

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret

## Vercel Deployment

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Go to **Settings** → **Environment Variables**
5. Add all the variables from above
6. Update these callback URLs in Auth0:
   - `https://your-app.vercel.app/api/auth/callback`
   - `https://your-app.vercel.app`

### Update .env for Production:
```env
AUTH0_CALLBACK_URL=https://your-app.vercel.app/api/auth/callback
AUTH0_LOGOUT_URL=https://your-app.vercel.app
PUBLIC_AUTH0_CALLBACK_URL=https://your-app.vercel.app/api/auth/callback
```

## Netlify Deployment

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click **Add new site** → **Import an existing project**
3. Choose your GitHub repository
4. Go to **Site settings** → **Environment variables**
5. Add all the variables
6. Update Auth0 callback URLs to use your Netlify URL

## Railway Deployment

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Add environment variables in the Railway dashboard
5. Update Auth0 callback URLs to use your Railway URL

## Important Security Notes

✅ `.env` is already in `.gitignore` - never commit it  
✅ Use `.env.example` as a template (safe to commit)  
✅ Always use environment variables in production  
✅ Rotate secrets if accidentally exposed  
✅ Use different Auth0 applications for dev/staging/prod  

## Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (will prompt for env vars on first deploy)
vercel

# Add environment variables
vercel env add AUTH0_DOMAIN
vercel env add AUTH0_CLIENT_ID
vercel env add AUTH0_CLIENT_SECRET
# ... add all other variables

# Deploy to production
vercel --prod
```

After deployment, update your Auth0 Application Settings with the production callback URLs!
