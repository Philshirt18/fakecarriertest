# FakeCarrier Deployment Guide

## Deploy Backend (API + Database) to Railway

### 1. Sign up for Railway
- Go to: https://railway.app
- Sign up with GitHub (free tier includes $5/month credit)

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy PostgreSQL"
3. Wait for database to provision

### 3. Add FastAPI Service
1. In the same project, click "New Service"
2. Select "GitHub Repo"
3. Connect your FakeCarrier repository
4. Select the `api` folder as root directory

### 4. Configure Environment Variables
In Railway, add these environment variables to your API service:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_TOKEN=your-secure-admin-token-here
GEMINI_API_KEY=your-gemini-api-key-here
```

Railway will automatically link the PostgreSQL database.

### 5. Deploy
- Railway will automatically deploy
- Note your API URL (e.g., `https://your-app.railway.app`)

---

## Deploy Frontend (Web App) to Vercel

### 1. Sign up for Vercel
- Go to: https://vercel.com
- Sign up with GitHub (free tier)

### 2. Import Project
1. Click "Add New Project"
2. Import your FakeCarrier repository
3. Select the `web` folder as root directory

### 3. Configure Environment Variables
Add this environment variable:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.railway.app
```

Replace with your actual Railway API URL.

### 4. Deploy
- Click "Deploy"
- Vercel will build and deploy automatically
- Note your web app URL (e.g., `https://fakecarrier.vercel.app`)

---

## Update Outlook Add-in Manifest

### 1. Update manifest.xml
Replace all instances of `localhost:3000` with your Vercel URL:
- `https://your-app.vercel.app`

Replace all instances of `localhost:8000` with your Railway API URL:
- `https://your-api.railway.app`

### 2. Re-upload to Microsoft 365
1. Go to Microsoft 365 Admin Center
2. Navigate to Integrated applications
3. Remove the old FakeCarrier add-in
4. Upload the updated manifest.xml
5. Deploy to your organization

---

## Test the Deployment

1. Go to your Vercel URL
2. Set up admin password in Settings
3. Test email scanning
4. Go to Outlook Web (outlook.office.com)
5. Open an email
6. Click the FakeCarrier button
7. The add-in should load and work!

---

## Troubleshooting

### Database Connection Issues
- Check that DATABASE_URL is correctly set in Railway
- Ensure PostgreSQL service is running

### CORS Issues
- The API is configured to allow all origins
- For production, update CORS settings in `api/app/main.py`

### Add-in Not Loading
- Verify manifest URLs are correct (HTTPS, not HTTP)
- Check browser console for errors
- Wait 10-15 minutes after uploading manifest for deployment

---

## Cost Estimate

- **Railway**: Free tier ($5/month credit) - enough for testing
- **Vercel**: Free tier - unlimited for personal projects
- **Total**: $0/month for testing and small usage

---

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure production CORS settings
3. Set up monitoring and logging
4. Add SSL certificate (automatic with Vercel/Railway)
5. Publish add-in to Microsoft AppSource (optional)
