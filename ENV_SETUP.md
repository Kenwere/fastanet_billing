# Environment Variables Configuration

This document outlines all required environment variables for deployment to Vercel and integration with Supabase.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** to find:
   - **Project URL** → Use as `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **Anon public key** → Use as `VITE_SUPABASE_ANON_KEY`
   - **Service role key** (keep secret) → Use as `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **Settings > Database** to find:
   - **Connection string** → Use as `DATABASE_URL`

## Vercel Deployment - API Server

Set these environment variables in your Vercel API deployment:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
API_BASE_URL=https://your-api.vercel.app/api
LOG_LEVEL=info
NODE_ENV=production
```

**Important**: After deploying the API, you'll get a Vercel URL. Update `API_BASE_URL` with that URL in format: `https://your-api-domain.vercel.app/api`

## Vercel Deployment - Frontend

Set these environment variables in your Vercel frontend deployment:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://your-api.vercel.app/api
VITE_DOMAIN=yourdomain.com
```

## Local Development

Create a `.env.local` file in `artifacts/api-server/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@...
API_BASE_URL=http://localhost:3000/api
LOG_LEVEL=debug
NODE_ENV=development
```

Create a `.env.local` file in `artifacts/fastanet/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DOMAIN=localhost
```

## Deployment Steps

### Step 1: Deploy Database Schema
```bash
cd lib/db
pnpm run push
```

### Step 2: Deploy API to Vercel
```bash
# Push to GitHub first
git push origin main

# In Vercel dashboard:
# 1. Click "New Project"
# 2. Import GitHub repo
# 3. Select "artifacts/api-server" as root directory
# 4. Add all environment variables from above
# 5. Deploy
```

### Step 3: Deploy Frontend to Vercel
```bash
# In Vercel dashboard:
# 1. Click "New Project"
# 2. Import same GitHub repo
# 3. Select "artifacts/fastanet" as root directory
# 4. Add all environment variables from above
# 5. Deploy
```

### Step 4: Update API_BASE_URL
After API deployment completes, copy the Vercel URL and update:
- API server: `API_BASE_URL` environment variable
- Frontend: `VITE_API_BASE_URL` environment variable
- Redeploy both projects

## Testing

1. **Register**: Go to frontend and create a new account
2. **Login**: Sign in with your credentials
3. **Add Router**: Navigate to Routers page and add a test router
4. **Download RSC**: Click "Download .rsc" - should work with correct API URL
5. **Check API**: All endpoints should require Bearer token authentication

## Troubleshooting

- **401 Unauthorized**: Check that `VITE_SUPABASE_ANON_KEY` matches in frontend
- **API not found**: Verify `VITE_API_BASE_URL` matches deployed API domain
- **Database errors**: Ensure `DATABASE_URL` is correct and `pnpm run push` was executed
- **Login fails**: Check Supabase authentication is enabled in project settings
