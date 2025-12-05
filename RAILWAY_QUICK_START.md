# Railway Quick Start - 5 Steps

Deploy FakeCarrier entirely on Railway in 15 minutes.

---

## Step 1: Create Project (2 min)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **"fakecarriertest"**

---

## Step 2: Add Database (1 min)

1. In your project, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Done! Railway auto-connects it

---

## Step 3: Deploy API (5 min)

1. Click **"New"** → **"GitHub Repo"** → Select your repo
2. Name it: **"api"**
3. Click on **"api"** service
4. Go to **"Settings"**:
   - Root Directory: `/api`
   - Start Command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Go to **"Variables"**, add:
   ```
   ADMIN_TOKEN=your-secure-password-here
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   GEMINI_API_KEY=your-key-optional
   PRIVACY_MODE=true
   ```
6. Click **"Deploy"**
7. After deploy, go to **"Settings"** → **"Networking"** → **"Generate Domain"**
8. **Copy the API URL** (you'll need it next)

---

## Step 4: Deploy Web (5 min)

1. Click **"New"** → **"GitHub Repo"** → Select your repo
2. Name it: **"web"**
3. Click on **"web"** service
4. Go to **"Settings"**:
   - Root Directory: `/web`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Go to **"Variables"**, add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url-from-step-3.up.railway.app
   ```
6. Click **"Deploy"**
7. After deploy, go to **"Settings"** → **"Networking"** → **"Generate Domain"**
8. **Copy the Web URL**

---

## Step 5: Update CORS (2 min)

1. Go back to **"api"** service
2. Click **"Variables"**
3. Add:
   ```
   ALLOWED_ORIGINS=https://your-web-url-from-step-4.up.railway.app
   ```
4. Service auto-redeploys

---

## ✅ Done! Test It

Visit your web URL and try scanning an email!

- **Web**: `https://web-production-xxxx.up.railway.app`
- **Admin**: `https://web-production-xxxx.up.railway.app/admin`
- **Analytics**: `https://web-production-xxxx.up.railway.app/admin/analytics`

---

## 💰 Cost

- **Free**: $5/month credit (good for testing)
- **Typical**: $15-25/month for production

---

## 🌐 Add Custom Domain (Optional)

### If you own fakecarrier.com:

**For Web:**
1. Web service → Settings → Networking → Custom Domain
2. Enter: `fakecarrier.com`
3. Add CNAME in your domain registrar:
   ```
   CNAME  @  your-web.up.railway.app
   ```

**For API:**
1. API service → Settings → Networking → Custom Domain
2. Enter: `api.fakecarrier.com`
3. Add CNAME in your domain registrar:
   ```
   CNAME  api  your-api.up.railway.app
   ```

**Update Variables:**
- Web: `NEXT_PUBLIC_API_BASE_URL=https://api.fakecarrier.com`
- API: `ALLOWED_ORIGINS=https://fakecarrier.com`

---

## 🐛 Troubleshooting

**Build fails?**
- Check logs in Deployments tab
- Verify root directory is correct

**CORS errors?**
- Check `ALLOWED_ORIGINS` in API matches web URL exactly
- Include `https://` and no trailing slash

**Can't connect to API?**
- Check `NEXT_PUBLIC_API_BASE_URL` in web service
- Test API directly: visit `https://your-api.up.railway.app/docs`

---

## 📊 Your Railway Project

```
FakeCarrier
├── Postgres (Database)
├── api (Backend) → https://api-xxx.up.railway.app
└── web (Frontend) → https://web-xxx.up.railway.app
```

---

## 🔄 Auto-Deploy

Push to GitHub = Auto-deploy:
```bash
git push origin main
```

Railway automatically rebuilds and deploys both services!

---

**Need more details?** See `RAILWAY_DEPLOYMENT.md` for the complete guide.
