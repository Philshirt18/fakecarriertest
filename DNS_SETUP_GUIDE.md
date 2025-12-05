# Easy DNS Setup Guide for FakeCarrier

## 🎯 Goal
Switch from Railway URLs to your custom domain: **fakecarriers.com**

**Current URLs:**
- API: `https://fakecarriertest-production.up.railway.app`
- Web: `https://scintillating-trust-production.up.railway.app`

**Target URLs:**
- API: `https://api.fakecarriers.com`
- Web: `https://fakecarriers.com` or `https://www.fakecarriers.com`

---

## 📋 What You'll Need

1. **Access to your domain registrar** (where fakecarriers.com is registered)
   - GoDaddy, Namecheap, Google Domains, etc.
   - Login credentials

2. **5-10 minutes** of time

3. **This guide** open on your screen

---

## 🚀 Step-by-Step Instructions

### Part 1: Add Custom Domain in Railway (5 minutes)

#### For the API Service:

1. **Go to Railway Dashboard**
   - Open https://railway.app
   - Click on your project

2. **Click on the API service** (fakecarriertest)

3. **Go to Settings tab**

4. **Scroll to "Networking" section**

5. **Click "Custom Domain"**

6. **Enter:** `api.fakecarriers.com`

7. **Railway will show you DNS records** - something like:
   ```
   Type: CNAME
   Name: api
   Value: fakecarriertest-production.up.railway.app
   ```
   
8. **Copy these values** - you'll need them in Part 2

9. **Leave this page open** - don't close it yet

---

#### For the Web Service:

1. **Click on the Web service** (scintillating-trust)

2. **Go to Settings tab**

3. **Scroll to "Networking" section**

4. **Click "Custom Domain"**

5. **Enter:** `fakecarriers.com` (or `www.fakecarriers.com`)

6. **Railway will show you DNS records** - something like:
   ```
   Type: CNAME
   Name: @  (or www)
   Value: scintillating-trust-production.up.railway.app
   ```

7. **Copy these values** - you'll need them in Part 2

---

### Part 2: Add DNS Records (5 minutes)

**You need to ask your client to do this part** since they have DNS access.

#### Instructions for Your Client:

1. **Log in to your domain registrar**
   - Go to GoDaddy, Namecheap, or wherever fakecarriers.com is registered
   - Log in with your credentials

2. **Find DNS Settings**
   - Look for: "DNS Management", "DNS Settings", "Manage DNS", or "Name Servers"
   - Usually under "Domain Settings" or "Advanced Settings"

3. **Add the API Record**
   - Click "Add Record" or "Add DNS Record"
   - **Type:** CNAME
   - **Name/Host:** `api`
   - **Value/Points to:** `fakecarriertest-production.up.railway.app`
   - **TTL:** Automatic or 3600
   - Click "Save"

4. **Add the Web Record**
   - Click "Add Record" again
   - **Type:** CNAME
   - **Name/Host:** `@` (for root domain) or `www` (for www subdomain)
   - **Value/Points to:** `scintillating-trust-production.up.railway.app`
   - **TTL:** Automatic or 3600
   - Click "Save"

5. **Wait 5-60 minutes** for DNS to propagate
   - Usually takes 5-15 minutes
   - Can take up to 1 hour in rare cases

---

### Part 3: Update Environment Variables (2 minutes)

After DNS is working, update Railway:

#### Update Web Service:

1. **Go to Web service** in Railway

2. **Click "Variables" tab**

3. **Find:** `NEXT_PUBLIC_API_BASE_URL`

4. **Change from:**
   ```
   https://fakecarriertest-production.up.railway.app
   ```
   
5. **Change to:**
   ```
   https://api.fakecarriers.com
   ```

6. **Click "Save"** - Railway will auto-redeploy

---

#### Update API Service:

1. **Go to API service** in Railway

2. **Click "Variables" tab**

3. **Find:** `ALLOWED_ORIGINS`

4. **Change from:**
   ```
   https://scintillating-trust-production.up.railway.app
   ```
   
5. **Change to:**
   ```
   https://fakecarriers.com
   ```
   
   Or if using www:
   ```
   https://www.fakecarriers.com,https://fakecarriers.com
   ```

6. **Click "Save"** - Railway will auto-redeploy

---

### Part 4: Test Everything (2 minutes)

1. **Wait for DNS propagation** (5-60 minutes after Part 2)

2. **Test the API:**
   - Visit: `https://api.fakecarriers.com`
   - You should see: `{"message":"FakeCarrier API",...}`

3. **Test the Web:**
   - Visit: `https://fakecarriers.com`
   - You should see the FakeCarrier homepage

4. **Test scanning:**
   - Enter an email address
   - Click "Scan Email"
   - Should work normally

5. **Done!** 🎉

---

## 🔍 Troubleshooting

### "DNS not found" or "Can't reach site"

**Problem:** DNS hasn't propagated yet

**Solution:** 
- Wait 15-30 more minutes
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito/private window
- Check DNS with: https://dnschecker.org

---

### "CORS error" or "Failed to fetch"

**Problem:** Environment variables not updated

**Solution:**
1. Check `ALLOWED_ORIGINS` in API service includes your domain
2. Check `NEXT_PUBLIC_API_BASE_URL` in Web service points to API domain
3. Make sure both start with `https://`
4. No trailing slashes

---

### API works but Web doesn't

**Problem:** Web DNS record not set correctly

**Solution:**
1. Check DNS record in your registrar
2. Make sure CNAME points to correct Railway URL
3. Some registrars don't allow CNAME for root (@)
   - Use `www.fakecarriers.com` instead
   - Or use A records (Railway will provide IPs)

---

### Web works but can't scan emails

**Problem:** API CORS not configured

**Solution:**
1. Go to API service → Variables
2. Update `ALLOWED_ORIGINS` to include web domain
3. Example: `https://fakecarriers.com,https://www.fakecarriers.com`

---

## 📊 DNS Record Examples

### Example 1: Using Root Domain (fakecarriers.com)

**In your DNS settings:**
```
Type    Name    Value                                           TTL
CNAME   api     fakecarriertest-production.up.railway.app      3600
CNAME   @       scintillating-trust-production.up.railway.app  3600
```

**Result:**
- API: https://api.fakecarriers.com
- Web: https://fakecarriers.com

---

### Example 2: Using WWW Subdomain

**In your DNS settings:**
```
Type    Name    Value                                           TTL
CNAME   api     fakecarriertest-production.up.railway.app      3600
CNAME   www     scintillating-trust-production.up.railway.app  3600
```

**Result:**
- API: https://api.fakecarriers.com
- Web: https://www.fakecarriers.com

---

### Example 3: Both Root and WWW

**In your DNS settings:**
```
Type    Name    Value                                           TTL
CNAME   api     fakecarriertest-production.up.railway.app      3600
CNAME   @       scintillating-trust-production.up.railway.app  3600
CNAME   www     scintillating-trust-production.up.railway.app  3600
```

**Result:**
- API: https://api.fakecarriers.com
- Web: https://fakecarriers.com AND https://www.fakecarriers.com

---

## 📝 Checklist

Use this checklist tomorrow:

### Before Starting:
- [ ] Have access to Railway dashboard
- [ ] Client has access to domain registrar
- [ ] Know which domain to use (root or www)

### In Railway:
- [ ] Add custom domain to API service
- [ ] Copy API DNS records
- [ ] Add custom domain to Web service
- [ ] Copy Web DNS records

### In Domain Registrar (Client):
- [ ] Log in to registrar
- [ ] Find DNS settings
- [ ] Add API CNAME record
- [ ] Add Web CNAME record
- [ ] Save changes

### Wait:
- [ ] Wait 15-30 minutes for DNS propagation
- [ ] Test API URL in browser
- [ ] Test Web URL in browser

### Update Railway:
- [ ] Update Web service environment variable
- [ ] Update API service environment variable
- [ ] Wait for auto-redeploy (2-3 minutes)

### Final Test:
- [ ] Visit https://fakecarriers.com
- [ ] Try scanning an email
- [ ] Check admin dashboard
- [ ] Check analytics page
- [ ] Everything works!

---

## 🎯 Quick Reference

### Current URLs (Railway):
```
API:  https://fakecarriertest-production.up.railway.app
Web:  https://scintillating-trust-production.up.railway.app
```

### Target URLs (Custom Domain):
```
API:  https://api.fakecarriers.com
Web:  https://fakecarriers.com
```

### DNS Records to Add:
```
CNAME  api  →  fakecarriertest-production.up.railway.app
CNAME  @    →  scintillating-trust-production.up.railway.app
```

### Environment Variables to Update:
```
Web Service:
  NEXT_PUBLIC_API_BASE_URL=https://api.fakecarriers.com

API Service:
  ALLOWED_ORIGINS=https://fakecarriers.com
```

---

## 💡 Tips

1. **Do this during low-traffic time** - DNS changes can cause brief downtime

2. **Keep Railway URLs working** - They'll still work even after adding custom domain

3. **Test before updating env vars** - Make sure DNS works first

4. **Use HTTPS** - Railway provides free SSL certificates automatically

5. **Both domains work** - Railway URLs and custom domain both work simultaneously

---

## 📞 Need Help?

If something doesn't work:

1. **Check Railway logs** - See if services are running
2. **Check DNS propagation** - Use https://dnschecker.org
3. **Check browser console** - Look for CORS or network errors
4. **Wait longer** - DNS can take up to 1 hour sometimes

---

**Good luck! The setup is straightforward and should take about 15 minutes total.** 🚀
