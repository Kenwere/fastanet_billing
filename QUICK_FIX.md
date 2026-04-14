# Quick Fix for 404 Error - Immediate Action Items

## What I've Fixed

✅ Vite config now uses `dist` (not `dist/public`) as output directory
✅ PORT and BASE_PATH are now optional with sensible defaults  
✅ Updated vercel.json with proper SPA routing configuration
✅ Created .vercelignore for optimized builds
✅ Fixed API server vercel.json

## Immediate Steps to Deploy

### Step 1: Push Changes to GitHub
```bash
cd c:\wifi\fastanet_replit\fastaet_replit
git add .
git commit -m "fix: vercel deployment - fix dist output and SPA routing"
git push origin main
```

### Step 2: Verify Vercel Project Settings (CRITICAL!)

Go to https://vercel.com → Select your frontend project → Settings → General

Ensure these are set correctly:

**For Frontend (fastanet) deployment:**
- Root Directory: `artifacts/fastanet`
- Build Command: `pnpm run build`
- Output Directory: `dist`
- Install Command: `pnpm install`

**Environment Variables (Settings → Environment Variables):**
Add these with scope = Production, Preview, Development:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (your anon key)
VITE_API_BASE_URL=https://your-api.vercel.app/api
VITE_DOMAIN=fastanet.com
```

### Step 3: Trigger Redeploy

After SSH and environment variables are set:
```bash
# Option A: Go to Vercel dashboard → Deployments → Latest → Redeploy
# Option B: Git push (already done in Step 1)
```

### Step 4: Monitor Build

1. Go to https://vercel.com/deployments
2. Click on the latest deployment
3. Watch the build process
4. Look for "Build Completed" message
5. Check for any errors in the logs

### Step 5: Test

Once deployment completes:
- Visit your Vercel frontend URL
- Should see FASTANET login page
- Click Register → should navigate to register page
- No 404 errors

## If Still Getting 404

1. **Check Build Logs** (Vercel → Deployments → Latest → Build Logs)
   - Look for any error messages
   - Verify dist/ folder is created
   - Check if index.html exists in output

2. **Clear Cache and Redeploy**
   - Vercel → Deployments → Latest → ... → Clear Cache
   - Click "Redeploy"

3. **Verify File Structure**
   - In Vercel logs, you should see files being served from dist/
   - Should include index.html, assets/, etc.

## API Server Deployment

For the API server, follow similar steps:
- Root Directory: `artifacts/api-server`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment Variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your service role key)
DATABASE_URL=postgresql://...
API_BASE_URL=https://your-api.vercel.app/api
NODE_ENV=production
LOG_LEVEL=info
```

## Files Modified

- `artifacts/fastanet/vite.config.ts` - Fixed output directory and env vars
- `artifacts/fastanet/vercel.json` - Added SPA routing with rewrites
- `artifacts/api-server/vercel.json` - Updated configuration
- `.vercelignore` - Added at root for monorepo optimization
- `VERCEL_404_FIX.md` - Detailed troubleshooting guide
