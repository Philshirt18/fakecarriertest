# Quick Deployment Guide - FakeCarrier

## 🚀 Deploy in 15 Minutes (No DNS Required Initially)

### Prerequisites
- GitHub account (you have this ✅)
- Credit card for platform signup (free tiers available)

---

## Step 1: Deploy API Backend (Railway - Recommended)

### Why Railway?
- Free tier: $5/month credit
- Automatic HTTPS
- PostgreSQL included
- Easy environment variables

### Instructions:

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your `fakecarriertest` repository
5. **Configure**:
   - Root directory: `/api`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

6. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-connects it

7. **Set Environment Variables**:
   ```
   ADMIN_TOKEN=your-secure-token-here
   GEMINI_API_KEY=your-gemini-key (optional)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PRIVACY_MODE=true
   ```

8. **Deploy** - Railway gives you: `https://your-api.up.railway.app`

9. **Copy this URL** - you'll need it for the web app

---

## Step 2: Deploy Web Frontend (Vercel - Recommended)

### Why Vercel?
- Free tier: Unlimited bandwidth
- Automatic HTTPS
- Next.js optimized
- Global CDN

### Instructions:

1. **Go to Vercel**: https://vercel.com
2. **Sign up** with GitHub
3. **New Project** → **Import** your `fakecarriertest` repo
4. **Configure**:
   - Framework: Next.js
   - Root directory: `/web`
   - Build command: `npm run build`
   - Output directory: `.next`

5. **Set Environment Variable**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app
   ```
   (Use the URL from Step 1)

6. **Deploy** - Vercel gives you: `https://your-app.vercel.app`

7. **Test it**: Visit your Vercel URL and try scanning an email!

---

## Step 3: Update CORS (Important!)

Your API needs to allow requests from your Vercel domain:

1. **Go to Railway** → Your API project
2. **Add Environment Variable**:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
   ```
3. **Redeploy** the API

---

## Step 4: Test Everything

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try scanning an email
3. Check admin dashboard: `https://your-app.vercel.app/admin`
4. Try analytics: `https://your-app.vercel.app/admin/analytics`

---

## 🌐 Optional: Add Custom Domain

### If You Have a Domain (e.g., fakecarrier.com)

#### For Vercel (Web):
1. **Vercel Dashboard** → Your project → **Settings** → **Domains**
2. **Add Domain**: `fakecarrier.com`
3. **Follow DNS instructions** - Vercel shows you exactly what to add
4. Usually: Add CNAME record pointing to `cname.vercel-dns.com`

#### For Railway (API):
1. **Railway Dashboard** → Your project → **Settings** → **Domains**
2. **Add Domain**: `api.fakecarrier.com`
3. **Follow DNS instructions** - Railway shows you what to add
4. Usually: Add CNAME record pointing to your Railway URL

#### Update Environment Variables:
After DNS is configured, update Vercel:
```
NEXT_PUBLIC_API_BASE_URL=https://api.fakecarrier.com
```

And Railway:
```
ALLOWED_ORIGINS=https://fakecarrier.com,https://www.fakecarrier.com
```

---

## 📋 DNS Configuration Example

If you own `fakecarrier.com`, add these records in your domain registrar:

### GoDaddy / Namecheap / Google Domains:

```
Type    Host    Value                           TTL
CNAME   @       cname.vercel-dns.com            Automatic
CNAME   www     cname.vercel-dns.com            Automatic
CNAME   api     your-api.up.railway.app         Automatic
```

**Note**: Some registrars don't allow CNAME for root (@). In that case:
- Use Vercel's A records instead (they'll provide the IPs)
- Or use `www.fakecarrier.com` as primary

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `ADMIN_TOKEN` to a strong random value
- [ ] Enable `PRIVACY_MODE=true` in Railway
- [ ] Set up HTTPS (automatic with Railway/Vercel)
- [ ] Configure CORS properly
- [ ] Test all features
- [ ] Set up monitoring (Railway/Vercel provide this)

---

## 💰 Cost Estimate

### Free Tier (Good for Testing):
- **Railway**: $5/month credit (free)
- **Vercel**: Unlimited (free)
- **Total**: $0/month

### Paid Tier (For Production):
- **Railway**: ~$10-20/month (API + Database)
- **Vercel**: $20/month (Pro features)
- **Domain**: ~$15/year
- **Total**: ~$30-40/month + domain

---

## 🆘 Troubleshooting

### "Failed to fetch" error:
- Check `NEXT_PUBLIC_API_BASE_URL` in Vercel
- Check `ALLOWED_ORIGINS` in Railway
- Make sure API is running (check Railway logs)

### "Database connection failed":
- Railway auto-connects PostgreSQL
- Check `DATABASE_URL` is set correctly
- Run migrations: Railway should do this automatically

### "Admin token invalid":
- Make sure `ADMIN_TOKEN` is set in Railway
- Use the same token when logging into admin

### DNS not working:
- DNS changes take 5-60 minutes to propagate
- Use `nslookup your-domain.com` to check
- Clear browser cache

---

## 📊 Monitoring

### Railway:
- **Logs**: Railway Dashboard → Your project → Logs
- **Metrics**: CPU, Memory, Network usage
- **Alerts**: Set up in Railway settings

### Vercel:
- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Real-time function logs
- **Performance**: Core Web Vitals

---

## 🔄 Updates & Maintenance

### To Deploy Updates:

1. **Push to GitHub**: `git push origin main`
2. **Automatic Deploy**: Both Railway and Vercel auto-deploy
3. **Check Status**: Watch deployment logs
4. **Test**: Visit your site and verify changes

### Database Migrations:

Railway runs migrations automatically on deploy. If you need manual migration:
```bash
railway run alembic upgrade head
```

---

## 🎯 Quick Start Commands

### Local Development:
```bash
# Start everything locally
docker compose up --build

# Access:
# Web: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Check Deployment Status:
```bash
# Railway CLI (optional)
railway status

# Vercel CLI (optional)
vercel --prod
```

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **FakeCarrier Docs**: See `DEPLOYMENT.md` for detailed guide

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] API deployed to Railway
- [ ] PostgreSQL added to Railway
- [ ] Environment variables set in Railway
- [ ] API URL copied
- [ ] Vercel account created
- [ ] Web deployed to Vercel
- [ ] API URL set in Vercel
- [ ] CORS configured in Railway
- [ ] Test scan completed
- [ ] Admin dashboard accessible
- [ ] Analytics working
- [ ] (Optional) Custom domain configured
- [ ] (Optional) DNS records added
- [ ] Security checklist completed

---

## 🎉 You're Live!

Once deployed, share your FakeCarrier instance:
- **Public URL**: `https://your-app.vercel.app`
- **Admin**: `https://your-app.vercel.app/admin`
- **Analytics**: `https://your-app.vercel.app/admin/analytics`

No DNS configuration needed to get started - Railway and Vercel provide URLs automatically!

---

**Questions?** Check the logs in Railway/Vercel dashboards or refer to `DEPLOYMENT.md` for more details.
