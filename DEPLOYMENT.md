# Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Your code pushed to GitHub

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
# If not already a git repo
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/yourusername/golf-society-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `golf-society-app` repository
5. Railway will detect the monorepo structure

### 3. Add PostgreSQL Database

1. In your Railway project dashboard
2. Click "+ New"
3. Select "Database" → "PostgreSQL"
4. Railway automatically creates a DATABASE_URL

### 4. Configure Backend Service

1. Click on the **server** service
2. Go to "Variables" tab
3. Add these environment variables:

```
JWT_SECRET=<generate-a-random-secret-here>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
```

**Note:** Railway auto-injects `DATABASE_URL` from the PostgreSQL service.

4. Go to "Settings" tab:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run deploy`

5. Click "Deploy"

### 5. Configure Frontend Service

1. Click on the **client** service (or add a new service if not auto-detected)
2. Go to "Settings":
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: (leave empty - Railway serves static files from build/)

3. Go to "Variables" tab and add:

```
REACT_APP_API_URL=https://your-backend-service.railway.app/api
```

**Note:** Get the backend URL from the backend service's "Settings" → "Domains"

4. Click "Deploy"

### 6. Generate Domain Names

1. For **Backend**:
   - Go to backend service → Settings → Networking
   - Click "Generate Domain"
   - Copy this URL (e.g., `https://golf-backend-production-abc123.up.railway.app`)

2. For **Frontend**:
   - Go to frontend service → Settings → Networking
   - Click "Generate Domain"
   - This is your app URL! (e.g., `https://golf-frontend-production-xyz789.up.railway.app`)

### 7. Update CORS Settings

1. Go back to **backend service** → Variables
2. Update `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://your-frontend-domain.railway.app,https://yourdomain.com
```

3. Redeploy the backend

### 8. Add Custom Domain (Optional)

1. Buy a domain (e.g., `livgolfsociety.com` from Namecheap)
2. In Railway frontend service → Settings → Networking:
   - Click "Custom Domain"
   - Enter your domain: `livgolfsociety.com`
   - Add CNAME record in your domain registrar:
     - Name: `@` or `www`
     - Value: (Railway provides this)

3. Update backend `ALLOWED_ORIGINS` to include your domain

### 9. Run Database Migrations

The backend automatically runs migrations on startup with `npm run deploy`.

If you need to run migrations manually:
1. Go to backend service → "..." menu → "Shell"
2. Run: `npx prisma migrate deploy`

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=<auto-injected-by-railway>
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-frontend.railway.app,https://yourdomain.com
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## Costs

- **Hobby Plan**: $5/month minimum
- **Typical golf society app**: ~$5-10/month total
  - Small PostgreSQL database
  - Backend Node.js service
  - Frontend static hosting

## Troubleshooting

### Backend won't start
- Check logs: Backend service → Deployments → Click latest → View logs
- Verify DATABASE_URL is set
- Ensure migrations ran successfully

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check backend CORS settings include frontend URL
- Ensure backend is running and accessible

### Database errors
- Check DATABASE_URL format
- Run migrations: `npx prisma migrate deploy`
- Generate Prisma client: `npx prisma generate`

## Support

Railway docs: https://docs.railway.app
Railway Discord: https://discord.gg/railway
