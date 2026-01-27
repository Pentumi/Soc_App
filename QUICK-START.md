# 🚀 Quick Deployment Checklist

## Before You Deploy

✅ **Files Ready**
- [x] `package.json` (root)
- [x] `railway.toml`
- [x] `nixpacks.toml`
- [x] `.env.example`
- [x] `.gitignore`
- [x] `DEPLOYMENT.md` (full guide)

## 5-Minute Railway Deploy

### 1️⃣ Push to GitHub (2 min)

```bash
cd soc-app

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/golf-society-app.git
git push -u origin main
```

### 2️⃣ Create Railway Project (1 min)

1. Go to **https://railway.app**
2. Click "**Start a New Project**"
3. Click "**Deploy from GitHub repo**"
4. Select your `golf-society-app` repo
5. Railway deploys automatically!

### 3️⃣ Add Database (30 seconds)

1. In Railway dashboard, click "**+ New**"
2. Select "**Database**" → "**PostgreSQL**"
3. Done! Railway auto-connects it

### 4️⃣ Set Environment Variables (1 min)

Click on your **server** service → **Variables** tab:

```
JWT_SECRET=your-random-secret-key-here-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.railway.app
```

**Important:** After frontend deploys, update `ALLOWED_ORIGINS` with the frontend URL!

### 5️⃣ Deploy Frontend (30 seconds)

If frontend didn't auto-deploy:
1. Click "**+ New**" → "**GitHub Repo**"
2. Same repo, but set **Root Directory** to `client`
3. Railway builds and deploys

### 6️⃣ Get Your URLs

**Backend:**
- Service → Settings → Networking → Generate Domain
- Example: `https://golf-backend-production.up.railway.app`

**Frontend:**
- Service → Settings → Networking → Generate Domain
- Example: `https://golf-frontend-production.up.railway.app`

**Update frontend variables:**
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### 7️⃣ Update CORS

Go back to backend variables and update:
```
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

## ✨ You're Live!

Visit your frontend URL and log in!

## 💰 Cost

- **First month**: ~$5 (after trial credits)
- **Monthly**: $5-10 for small golf society
- Very affordable! 🎉

## 🌐 Custom Domain (Optional)

1. Buy domain: `livgolfsociety.com` (~$10/year)
2. Frontend service → Settings → Custom Domain
3. Add CNAME record from your registrar
4. Update backend CORS to include your domain

## Need Help?

See `DEPLOYMENT.md` for detailed troubleshooting!

---

**Total Time: ~5 minutes** ⏱️
**Total Cost: ~$5/month** 💵
