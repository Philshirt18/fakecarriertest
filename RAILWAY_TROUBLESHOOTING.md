# Railway Deployment Troubleshooting

## 🔍 How to View Error Logs

1. Click on the **failed deployment** in Railway
2. Look at the **Build Logs** or **Deploy Logs** tab
3. Scroll to the bottom to see the error

---

## Common Errors & Fixes

### Error 1: "No such file or directory"

**Cause:** Wrong root directory

**Fix:**
1. Go to service → **Settings**
2. Set **Root Directory** to `/api` (for API) or `/web` (for Web)
3. Redeploy

---

### Error 2: "Module not found" or "Import error"

**Cause:** Dependencies not installed

**Fix:**
1. Check `requirements.txt` exists in `/api`
2. Railway should auto-detect and install
3. If not, add build command in Settings:
   ```
   pip install -r requirements.txt
   ```

---

### Error 3: "Port already in use" or "Address in use"

**Cause:** Not using Railway's `$PORT` variable

**Fix:**
1. Go to service → **Settings**
2. Set **Start Command** to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Make sure you use `$PORT` not `8000`

---

### Error 4: "Database connection failed"

**Cause:** Missing `DATABASE_URL` or Postgres not connected

**Fix:**
1. Make sure Postgres service exists in project
2. Go to API service → **Variables**
3. Add:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
4. Redeploy

---

### Error 5: "Alembic migration failed"

**Cause:** Database not ready or migration issues

**Fix Option 1 - Skip migrations for now:**
1. Go to service → **Settings**
2. Change **Start Command** to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Redeploy
4. Run migrations manually later

**Fix Option 2 - Use startup script:**
1. Use the `start.sh` script (already created)
2. Set **Start Command** to:
   ```
   bash start.sh
   ```

---

### Error 6: "Build timeout" or "Build too slow"

**Cause:** Large dependencies or slow build

**Fix:**
1. Go to service → **Settings** → **Advanced**
2. Increase **Build Timeout** to 10-15 minutes
3. Redeploy

---

### Error 7: "CORS error" (after deployment succeeds)

**Cause:** Wrong `ALLOWED_ORIGINS`

**Fix:**
1. Go to API service → **Variables**
2. Update `ALLOWED_ORIGINS` with exact web URL:
   ```
   ALLOWED_ORIGINS=https://web-production-xxxx.up.railway.app
   ```
3. No trailing slash, include `https://`

---

## 🚀 Recommended Settings for API Service

### Settings Tab:
- **Root Directory**: `/api`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Build Command**: Leave empty (auto-detect)

### Variables Tab:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_TOKEN=your-secure-token-here
PRIVACY_MODE=true
ALLOWED_ORIGINS=https://your-web-url.up.railway.app
```

### Optional Variables:
```bash
GEMINI_API_KEY=your-key-here
MAX_HEADER_SIZE=50000
MAX_BODY_SIZE=100000
DOMAIN_AGE_PROVIDER=mock
```

---

## 🌐 Recommended Settings for Web Service

### Settings Tab:
- **Root Directory**: `/web`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Variables Tab:
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.up.railway.app
```

---

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] Root directory is set correctly (`/api` or `/web`)
- [ ] Start command uses `$PORT` variable
- [ ] Database service exists (for API)
- [ ] `DATABASE_URL` variable is set (for API)
- [ ] `ADMIN_TOKEN` is set (for API)
- [ ] `NEXT_PUBLIC_API_BASE_URL` is set (for Web)
- [ ] All required files exist in repo:
  - `/api/requirements.txt`
  - `/api/app/main.py`
  - `/web/package.json`
  - `/web/next.config.js`

---

## 🔧 Manual Deployment Steps

If auto-deploy fails, try manual approach:

### For API:

1. **Create service** from GitHub repo
2. **Settings**:
   - Root: `/api`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ADMIN_TOKEN=secure-token-123
   PRIVACY_MODE=true
   ```
4. **Deploy**
5. **Generate Domain** in Networking tab

### For Web:

1. **Create service** from GitHub repo
2. **Settings**:
   - Root: `/web`
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. **Variables**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api-url-from-above.up.railway.app
   ```
4. **Deploy**
5. **Generate Domain** in Networking tab

---

## 🐛 Still Having Issues?

### Check These:

1. **View Logs**:
   - Click deployment → View logs
   - Look for red error messages
   - Copy the error and search online

2. **Test Locally**:
   ```bash
   cd api
   pip install -r requirements.txt
   uvicorn app.main:app --port 8000
   ```
   If it works locally, it should work on Railway.

3. **Simplify**:
   - Remove migrations from start command
   - Deploy just the basic app first
   - Add complexity later

4. **Railway Logs**:
   - Service → Deployments → Click deployment
   - Check both Build and Deploy logs
   - Error is usually at the bottom

---

## 💡 Quick Fixes to Try

### Fix 1: Simplify Start Command
```bash
# Instead of:
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Use:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Fix 2: Use Procfile
Create `api/Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Fix 3: Check Python Version
Add `api/runtime.txt`:
```
python-3.12
```

### Fix 4: Verify Requirements
Make sure `api/requirements.txt` includes:
```
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
alembic
python-dotenv
dnspython
httpx
```

---

## 📞 Get Help

1. **Railway Discord**: https://discord.gg/railway
2. **Railway Docs**: https://docs.railway.app
3. **Check Logs**: Most errors are explained in the logs

---

## ✅ Success Indicators

Deployment succeeded when you see:

- ✅ Green checkmark in Railway
- ✅ "Deployment successful" message
- ✅ Service shows "Active" status
- ✅ Can visit the generated URL
- ✅ API docs work: `https://your-api.up.railway.app/docs`

---

**Copy the error message from Railway logs and I can help you fix it!**
