# Vercel 404 Error - Troubleshooting Guide

## Issue
Getting `404: NOT_FOUND` error when viewing your deployed app on Vercel.

## Root Causes

### 1. Build Output Directory Issue
The dist folder may not be created properly during build.

**Fix**: The vite.config.ts has been updated to:
- Use `dist` as the output directory (not `dist/public`)
- Make PORT and BASE_PATH optional with defaults

**Verify**: Check Vercel build logs:
- Go to your Vercel project
- Click "Deployments"
- Select the latest deployment
- Click "View Logs" → check if build succeeded
- Look for "dist/" in the build output

### 2. Environment Variables Not Set
Without some env vars, the build might fail or output empty.

**Fix**: Set these in Vercel (Settings > Environment Variables):
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_API_BASE_URL=your-api-url
VITE_DOMAIN=your-domain
```

**Complete & Redeploy** after setting these.

### 3. Monorepo Structure Issue
Vercel needs to know to build the frontend, not the monorepo root.

**Verify in Vercel Settings**:
1. Go to your Vercel project settings
2. Check **General** section
3. Ensure **Root Directory** is set to: `artifacts/fastanet`
4. Build Command should be: `pnpm run build`
5. Output Directory should be: `dist`

### 4. Dependencies Not Installed
The monorepo uses pnpm workspaces which might not work by default on Vercel.

**Fix**: Add to `.vercelignore`:
```
# Don't ignore anything, we need all dependencies
```

**Or** add `vercel.json` at root with pnpm configuration.

## Step-by-Step Fix

### 1. Verify Vercel Project Settings
```
Vercel Dashboard → Your Project → Settings → General

Root Directory: artifacts/fastanet
Build Command: pnpm run build
Output Directory: dist
Install Command: pnpm install
```

### 2. Set Environment Variables
```
Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY  
- VITE_API_BASE_URL
- VITE_DOMAIN (optional)

Select: Production, Preview, Development
```

### 3. Check Build Logs
```
Vercel Dashboard → Deployments → Latest → View Logs

Look for:
✓ "Build Completed" message
✓ "dist/" folder created
✓ No TypeScript errors
```

### 4. Redeploy
- Click "Redeploy" on the latest deployment
- Or push to GitHub: `git push origin main`

### 5. Clear Cache (if still 404)
```
Vercel Dashboard → Deployments → Latest → ⋯ → Clear Cache
Then click "Redeploy"
```

## Local Build Test

Before redeploying, test locally:

```bash
cd artifacts/fastanet

# Build for production
VITE_SUPABASE_URL=test VITE_SUPABASE_ANON_KEY=test VITE_API_BASE_URL=test pnpm run build

# Check if dist folder exists and has index.html
ls dist/
ls dist/index.html  # Should exist
```

## Common Build Log Errors

### Error: "PORT environment variable is required"
**Status**: ✓ FIXED - Should not appear anymore

### Error: "Cannot find module"
**Solution**: 
```bash
cd artifacts/fastanet
pnpm install
pnpm run build
```

### Error: "Workspace not found"
**Solution**: 
1. In Vercel settings, set Root Directory to `artifacts/fastanet`
2. This tells Vercel to run build from that folder context

## Verification After Fix

- [ ] Visit your Vercel domain
- [ ] Should show the FASTANET login page
- [ ] No 404 error
- [ ] Can navigate to /register (should load register page)
- [ ] Can navigate to /login (should load login page)

## Emergency: Redeploy from GitHub

If still having issues:

```bash
# Make a small change and push
git add .
git commit -m "fix: vercel deployment configuration"
git push origin main
```

This triggers a fresh deployment which often fixes cache-related issues.

## Need Help?

If still seeing 404:
1. Check Vercel build logs for specific error messages
2. Verify environment variables are all set
3. Verify Root Directory is `artifacts/fastanet`
4. Check that vite.config.ts doesn't throw errors
5. Try clearing cache and redeploying
