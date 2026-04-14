# Vercel Deployment Checklist

## Pre-Deployment

- [ ] All code pushed to GitHub (`git push origin main`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Supabase project created and project URL obtained
- [ ] All Supabase credentials copied (URL, anon key, service key, database URL)

## 1. Database Schema Deployment

- [ ] Run `cd lib/db && pnpm run push` to create tables in Supabase
- [ ] Verify tables are created in Supabase dashboard: https://app.supabase.com

## 2. API Server Deployment

- [ ] Go to Vercel.com and sign in
- [ ] Click "Add New..." → "Project"
- [ ] Select your GitHub repository
- [ ] **Root Directory**: Select `artifacts/api-server`
- [ ] **Environment Variables**: Add all from `.env.example`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `API_BASE_URL` = placeholder for now (update after deployment)
  - `LOG_LEVEL=info`
  - `NODE_ENV=production`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy the deployment URL (e.g., `https://your-api.vercel.app`)

## 3. Update API_BASE_URL

- [ ] Go back to API project settings → Environment Variables
- [ ] Update `API_BASE_URL` to: `https://your-api.vercel.app/api` (from step 2)
- [ ] Redeploy the API server

## 4. Frontend Deployment

- [ ] Go to Vercel.com
- [ ] Click "Add New..." → "Project"
- [ ] Select same GitHub repository
- [ ] **Root Directory**: Select `artifacts/fastanet`
- [ ] **Build Settings**: 
  - Build Command: `pnpm run build`
  - Output Directory: `dist`
- [ ] **Environment Variables**: Add all from `.env.example`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL` = `https://your-api.vercel.app/api` (from API deployment)
  - `VITE_DOMAIN` = your custom domain or keep as `fastanet.com`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

## 5. Custom Domain (Optional)

- [ ] Go to frontend project settings → Domains
- [ ] Add your custom domain (e.g., `fastanet.com`)
- [ ] Follow Vercel instructions to update DNS

## Testing

### API Server
- [ ] Test health endpoint: `https://your-api.vercel.app/api/health`
- [ ] Should return `{ "status": "ok" }`

### Frontend
- [ ] Visit deployment URL
- [ ] Register a new account
- [ ] Login with credentials
- [ ] Navigate to Routers page
- [ ] Add a test router
- [ ] Download .rsc file - should work without errors
- [ ] Check browser console for errors

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check `VITE_SUPABASE_ANON_KEY` is correct in frontend |
| API not found | Verify `VITE_API_BASE_URL` matches API deployment domain |
| Build fails | Check all env vars are set, run `pnpm install` locally first |
| Database errors | Make sure `pnpm run push` was executed from `lib/db` directory |
| Login fails | Verify Supabase Auth is enabled: Settings > Authentication |

## Post-Deployment

- [ ] Monitor Vercel dashboard for any deployment errors
- [ ] Check Supabase dashboard for database issues
- [ ] Test all main features (register, login, add router)
- [ ] Set up Vercel and Supabase alerts/monitoring
