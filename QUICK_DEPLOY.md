# Quick Deployment Guide

## 🚀 Deploy in 3 Steps (No Code Changes Needed)

### Step 1: Generate Secure Token
```bash
openssl rand -hex 32
```
Copy the output (e.g., `a1b2c3d4e5f6...`)

### Step 2: Set Environment Variable
```bash
export ADMIN_TOKEN="paste_your_token_here"
```

### Step 3: Deploy
```bash
docker compose up -d
```

**That's it!** Your admin token is set without touching any code.

---

## 📋 Platform-Specific Instructions

### Docker Compose
```bash
# Create .env file
echo "ADMIN_TOKEN=$(openssl rand -hex 32)" > .env
docker compose up -d
```

### Heroku
```bash
heroku config:set ADMIN_TOKEN=$(openssl rand -hex 32)
git push heroku main
```

### AWS ECS
```bash
# In task definition JSON
"environment": [{"name": "ADMIN_TOKEN", "value": "your_token"}]
```

### Google Cloud Run
```bash
gcloud run deploy --set-env-vars ADMIN_TOKEN=your_token
```

### Kubernetes
```bash
kubectl create secret generic fakecarrier \
  --from-literal=admin-token=$(openssl rand -hex 32)
```

---

## 🔑 Access Admin Dashboard

1. Visit: `https://yourdomain.com/admin`
2. Enter your `ADMIN_TOKEN`
3. Done!

---

## 💡 Key Points

✅ Token is set via **environment variables**  
✅ No code modification required  
✅ Each deployment can have unique token  
✅ Token never committed to git  
✅ Easy to rotate/change  

---

## 📚 Full Documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.
