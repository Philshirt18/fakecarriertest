# Railway-Only Deployment Guide

Deploy both API and Web on Railway for simplicity and cost-effectiveness.

## 🚀 Quick Setup (15 minutes)

### Prerequisites
- GitHub account with your code pushed
- Railway account (sign up at https://railway.app)
- Credit card for Railway (free $5/month credit)

---

## Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `fakecarriertest` repository
5. Railway will detect it's a monorepo

---

## Step 2: Deploy PostgreSQL Database

1. In your Railway project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically provisions it
4. Note: Database URL is auto-configured as `${{Postgres.DATABASE_URL}}`

---

## Step 3: Deploy API Backend

### Create API Service:

1. Click **"New"** → **"GitHub Repo"** → Select your repo again
2. Railway asks which service - choose **"Create new service"**
3. Name it: **"api"**

### Configure API Service:

1. Click on the **"api"** service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `/api`
4. Set **Start Command**: 
   ```bash
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Set Environment Variables:

Click **"Variables"** tab and add:

```bash
# Required
ADMIN_TOKEN=your-super-secure-random-token-here
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Optional but recommended
GEMINI_API_KEY=your-gemini-api-key
PRIVACY_MODE=true
MAX_HEADER_SIZE=50000
MAX_BODY_SIZE=100000

# Will be set after web deployment
ALLOWED_ORIGINS=https://your-web-service.up.railway.app
```

### Deploy:
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, click **"Settings"** → **"Networking"**
4. Click **"Generate Domain"**
5. Copy your API URL: `https://api-production-xxxx.up.railway.app`

---

## Step 4: Deploy Web Frontend

### Create Web Service:

1. Click **"New"** → **"GitHub Repo"** → Select your repo again
2. Name it: **"web"**

### Configure Web Service:

1. Click on the **"web"** service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `/web`
4. Set **Build Command**: 
   ```bash
   npm install && npm run build
   ```
5. Set **Start Command**: 
   ```bash
   npm start
   ```

### Set Environment Variables:

Click **"Variables"** tab and add:

```bash
# Use the API URL from Step 3
NEXT_PUBLIC_API_BASE_URL=https://api-production-xxxx.up.railway.app
```

### Deploy:
1. Click **"Deploy"**
2. Wait for build to complete (~3-5 minutes)
3. Once deployed, click **"Settings"** → **"Networking"**
4. Click **"Generate Domain"**
5. Copy your Web URL: `https://web-production-yyyy.up.railway.app`

---

## Step 5: Update CORS

Now that you have the web URL, update the API:

1. Go back to **"api"** service
2. Click **"Variables"** tab
3. Update **ALLOWED_ORIGINS**:
   ```bash
   ALLOWED_ORIGINS=https://web-production-yyyy.up.railway.app
   ```
4. Service will auto-redeploy

---

## Step 6: Test Everything

1. Visit your web URL: `https://web-production-yyyy.up.railway.app`
2. Try scanning an email
3. Check admin: `https://web-production-yyyy.up.railway.app/admin`
4. Check analytics: `https://web-production-yyyy.up.railway.app/admin/analytics`

---

## 🌐 Optional: Add Custom Domain

### If you own a domain (e.g., fakecarrier.com):

#### For Web Service:
1. Go to **"web"** service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter: `fakecarrier.com` and `www.fakecarrier.com`
4. Railway shows you DNS records to add:
   ```
   Type    Name    Value
   CNAME   @       your-web.up.railway.app
   CNAME   www     your-web.up.railway.app
   ```
5. Add these in your domain registrar (GoDaddy, Namecheap, etc.)
6. Wait 5-60 minutes for DNS propagation

#### For API Service:
1. Go to **"api"** service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter: `api.fakecarrier.com`
4. Railway shows you DNS record:
   ```
   Type    Name    Value
   CNAME   api     your-api.up.railway.app
   ```
5. Add this in your domain registrar

#### Update Environment Variables:
After DNS is working:

**Web service:**
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.fakecarrier.com
```

**API service:**
```bash
ALLOWED_ORIGINS=https://fakecarrier.com,https://www.fakecarrier.com
```

---

## 📊 Railway Project Structure

Your Railway project will have 3 services:

```
FakeCarrier Project
├── 📦 Postgres (Database)
│   └── Automatic connection to API
├── 🔧 api (Backend)
│   ├── URL: https://api-production-xxxx.up.railway.app
│   └── Connected to Postgres
└── 🌐 web (Frontend)
    ├── URL: https://web-production-yyyy.up.railway.app
    └── Connects to API
```

---

## 💰 Cost Breakdown

### Free Tier:
- **$5/month credit** (free)
- Good for testing and low traffic

### Typical Usage:
- **Database**: ~$5/month
- **API**: ~$5-10/month
- **Web**: ~$5-10/month
- **Total**: ~$15-25/month

### Cost Optimization:
- Use **sleep mode** for non-production services
- Set **resource limits** in service settings
- Monitor usage in Railway dashboard

---

## 🔧 Configuration Files

Railway uses these files (already created):

```
fakecarriertest/
├── railway.json          # Root config
├── railway.toml          # Alternative config
├── api/
│   └── railway.json      # API-specific config
└── web/
    └── railway.json      # Web-specific config
```

---

## 🔄 Automatic Deployments

Railway auto-deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically:
# 1. Detects the push
# 2. Builds both services
# 3. Runs migrations (API)
# 4. Deploys new version
# 5. Zero-downtime deployment
```

---

## 📝 Environment Variables Reference

### API Service:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` | Auto-set by Railway |
| `ADMIN_TOKEN` | Yes | `super-secret-token-123` | Admin password |
| `GEMINI_API_KEY` | No | `AIza...` | For AI analysis |
| `PRIVACY_MODE` | No | `true` | Truncate stored content |
| `ALLOWED_ORIGINS` | Yes | `https://web-xxx.up.railway.app` | CORS origins |
| `MAX_HEADER_SIZE` | No | `50000` | Max header bytes |
| `MAX_BODY_SIZE` | No | `100000` | Max body bytes |

### Web Service:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://api-xxx.up.railway.app` | API endpoint |

---

## 🐛 Troubleshooting

### Build Fails:

**Check logs:**
1. Click on service → **"Deployments"** tab
2. Click on failed deployment
3. View build logs

**Common issues:**
- Missing dependencies: Check `requirements.txt` or `package.json`
- Wrong root directory: Verify in Settings
- Build timeout: Increase in Settings → Advanced

### Database Connection Fails:

**Check:**
1. `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
2. Postgres service is running
3. API service has access to Postgres (should be automatic)

**Fix:**
1. Go to API service → Variables
2. Ensure `DATABASE_URL=${{Postgres.DATABASE_URL}}`
3. Redeploy

### CORS Errors:

**Symptoms:**
- "Failed to fetch" in browser console
- "CORS policy" errors

**Fix:**
1. Go to API service → Variables
2. Update `ALLOWED_ORIGINS` with exact web URL
3. Include protocol: `https://`
4. No trailing slash

### Web Can't Connect to API:

**Check:**
1. Web service → Variables → `NEXT_PUBLIC_API_BASE_URL`
2. Should be full API URL with `https://`
3. API service is running and healthy
4. Test API directly: `https://api-xxx.up.railway.app/docs`

---

## 📊 Monitoring

### View Logs:
1. Click on service
2. Go to **"Deployments"** tab
3. Click on active deployment
4. View real-time logs

### Metrics:
1. Click on service
2. Go to **"Metrics"** tab
3. View:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### Alerts:
1. Project settings → **"Notifications"**
2. Add webhook or email
3. Get notified of:
   - Deployment failures
   - Service crashes
   - High resource usage

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `ADMIN_TOKEN` to strong random value
- [ ] Enable `PRIVACY_MODE=true`
- [ ] Set proper `ALLOWED_ORIGINS`
- [ ] Use HTTPS (automatic with Railway)
- [ ] Review Railway access permissions
- [ ] Set up monitoring and alerts
- [ ] Test all features
- [ ] Backup database regularly

---

## 🎯 Quick Commands

### Railway CLI (Optional):

Install:
```bash
npm i -g @railway/cli
```

Login:
```bash
railway login
```

Link project:
```bash
railway link
```

View logs:
```bash
railway logs
```

Run command in Railway environment:
```bash
railway run python manage.py migrate
```

---

## 📦 Database Backups

### Automatic Backups:
Railway automatically backs up Postgres daily.

### Manual Backup:
1. Go to Postgres service
2. Click **"Data"** tab
3. Click **"Backup"**
4. Download backup file

### Restore:
1. Create new Postgres service
2. Upload backup file
3. Update `DATABASE_URL` in API service

---

## 🚀 Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] Postgres database created
- [ ] API service deployed
- [ ] API domain generated
- [ ] Web service deployed
- [ ] Web domain generated
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Test scan completed
- [ ] Admin dashboard works
- [ ] Analytics works
- [ ] (Optional) Custom domains added
- [ ] (Optional) DNS configured
- [ ] Monitoring set up
- [ ] Backups configured

---

## 🎉 You're Live!

Your FakeCarrier is now running on Railway:

- **Web**: `https://web-production-yyyy.up.railway.app`
- **API**: `https://api-production-xxxx.up.railway.app`
- **API Docs**: `https://api-production-xxxx.up.railway.app/docs`
- **Admin**: `https://web-production-yyyy.up.railway.app/admin`
- **Analytics**: `https://web-production-yyyy.up.railway.app/admin/analytics`

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **FakeCarrier Issues**: Check logs in Railway dashboard

---

## 🔄 Next Steps

1. **Test thoroughly** - Try all features
2. **Monitor usage** - Check Railway metrics
3. **Set up alerts** - Get notified of issues
4. **Add custom domain** - If you have one
5. **Share with users** - Start scanning emails!

---

**Questions?** Check Railway logs or refer to Railway documentation.
