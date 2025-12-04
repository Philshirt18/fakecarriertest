# FakeCarrier Deployment Checklist

## Information Needed from Client

### 1. Domain & DNS Access
- [ ] **Domain name** (e.g., fakecarrier.com)
- [ ] **DNS provider login credentials** or ability to add DNS records
  - Need to add A/CNAME records for hosting
  - Need to configure SSL certificate

### 2. Admin Access
- [ ] **Admin password** for the dashboard (client should choose a secure password)
- [ ] **Admin email** for notifications (optional)

### 3. Microsoft 365 Integration (if using Outlook add-in)
- [ ] Does client have **Microsoft 365 Business/Enterprise**?
  - Personal accounts cannot install custom add-ins
- [ ] **Microsoft 365 Admin Center access** (admin.microsoft.com)
  - Need admin rights to deploy add-in to organization
- [ ] **Number of users** who will use the add-in

### 4. AI Features (Optional)
- [ ] Does client want **AI-powered analysis**?
  - If yes, they need a **Google Gemini API key** (free tier available)
  - Get from: https://aistudio.google.com/app/apikey

### 5. Branding (Already Done)
- [x] Logo files (already provided)
- [x] Brand colors (already configured)
- [x] Company name (Fake Carriers)

---

## Hosting Options & Pricing

### Option 1: Railway (Recommended - Easiest)
**Best for: Quick deployment, automatic scaling**

- **Free Tier**: $0/month
  - 500 hours/month execution time
  - $5 credit included
  - Good for testing/low usage
  
- **Hobby Plan**: $5/month
  - Unlimited execution time
  - Better for production use
  - Automatic SSL certificates
  - Custom domain included

**Setup Time**: 15-30 minutes
**Technical Difficulty**: Easy (one-click deploy)

---

### Option 2: Vercel (Frontend) + Railway (Backend)
**Best for: Better performance, separate scaling**

**Vercel (Frontend)**:
- **Free Tier**: $0/month
  - 100GB bandwidth
  - Unlimited websites
  - Automatic SSL
  - Custom domain included

**Railway (Backend)**:
- **Hobby Plan**: $5/month
  - For API/database

**Total**: $5/month
**Setup Time**: 30-45 minutes
**Technical Difficulty**: Medium

---

### Option 3: DigitalOcean/Linode VPS
**Best for: Full control, predictable costs**

- **Basic Droplet**: $6-12/month
  - 1-2 GB RAM
  - 25-50 GB SSD
  - 1-2 TB transfer
  - Full server control

**Total**: $6-12/month
**Setup Time**: 1-2 hours
**Technical Difficulty**: Advanced (requires server management)

---

### Option 4: AWS/Google Cloud
**Best for: Enterprise, high availability**

- **Estimated Cost**: $20-50/month
  - Depends on usage
  - Auto-scaling
  - High availability
  - Professional infrastructure

**Setup Time**: 2-3 hours
**Technical Difficulty**: Advanced

---

## Recommended Setup for Client

### For Small Business (< 50 users):
**Railway Hobby Plan - $5/month**
- Easiest to set up
- Automatic SSL
- Custom domain support
- Scales automatically
- No server management needed

### For Medium Business (50-200 users):
**Vercel + Railway - $5/month**
- Better performance
- Faster page loads
- Separate scaling
- Still easy to manage

### For Enterprise (200+ users):
**AWS/Google Cloud - $20-50/month**
- High availability
- Better security
- Compliance features
- Professional support

---

## Additional Costs

### Domain Name (if client doesn't have one)
- **Cost**: $10-15/year
- **Providers**: Namecheap, GoDaddy, Google Domains

### SSL Certificate
- **Cost**: FREE (included with all hosting options)
- Let's Encrypt automatic certificates

### Google Gemini API (Optional AI features)
- **Free Tier**: 60 requests/minute
- **Paid**: $0.00025 per 1K characters (very cheap)
- **Estimated**: $0-5/month for typical usage

---

## Deployment Timeline

### Phase 1: Setup (Day 1)
1. Get domain DNS access
2. Choose hosting provider
3. Set admin password
4. Deploy application

### Phase 2: Configuration (Day 1-2)
1. Configure custom domain
2. Set up SSL certificate
3. Test email scanning
4. Configure AI (if needed)

### Phase 3: Outlook Integration (Day 2-3)
1. Update manifest with production URL
2. Upload to Microsoft 365 Admin Center
3. Deploy to organization
4. Test with users

### Phase 4: Training & Handoff (Day 3-4)
1. Train admin on dashboard
2. Provide user documentation
3. Test with real emails
4. Go live!

**Total Time**: 3-4 days

---

## What I Need to Complete Deployment

1. **Hosting choice** (Railway recommended)
2. **Domain name** and DNS access
3. **Admin password** (client chooses)
4. **Microsoft 365 admin access** (if using Outlook add-in)
5. **Gemini API key** (if using AI features)

Once I have this information, I can:
- Deploy the application
- Configure the domain
- Set up SSL
- Deploy Outlook add-in
- Train the client

---

## Monthly Cost Summary

| Setup | Hosting | AI (Optional) | Total |
|-------|---------|---------------|-------|
| Small Business | $5 | $0-5 | **$5-10/month** |
| Medium Business | $5 | $0-5 | **$5-10/month** |
| Enterprise | $20-50 | $5-10 | **$25-60/month** |

**Recommendation for your client: Railway Hobby Plan ($5/month)**
- Simple, reliable, and affordable
- Perfect for small to medium businesses
- Can upgrade later if needed
