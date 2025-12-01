# FakeCarrier Deployment Guide

Complete guide for deploying FakeCarrier to production without modifying code.

## Setting Admin Token (No Code Access Required)

The admin token is configured via **environment variables**, not in the code. This means anyone deploying FakeCarrier can set their own secure token without accessing or modifying the source code.

### Method 1: Environment Variables (Recommended)

When deploying, set the `ADMIN_TOKEN` environment variable:

```bash
export ADMIN_TOKEN="your_secure_random_token_here"
```

Then start the services:

```bash
docker compose up -d
```

### Method 2: .env File

Create a `.env` file in the project root (this file is gitignored):

```bash
# .env
ADMIN_TOKEN=your_secure_random_token_here
GEMINI_API_KEY=your_gemini_key_here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Docker Compose automatically reads this file.

### Method 3: Docker Compose Override

Create a `docker-compose.override.yml` file (also gitignored):

```yaml
version: '3.8'

services:
  api:
    environment:
      ADMIN_TOKEN: "your_secure_random_token_here"
```

This overrides the default values without modifying the main docker-compose.yml.

### Method 4: Cloud Platform Environment Variables

Most cloud platforms provide environment variable configuration:

#### AWS ECS/Fargate
```bash
# In task definition
{
  "environment": [
    {
      "name": "ADMIN_TOKEN",
      "value": "your_secure_token"
    }
  ]
}
```

#### Heroku
```bash
heroku config:set ADMIN_TOKEN=your_secure_token
```

#### Google Cloud Run
```bash
gcloud run deploy fakecarrier-api \
  --set-env-vars ADMIN_TOKEN=your_secure_token
```

#### Azure Container Instances
```bash
az container create \
  --environment-variables ADMIN_TOKEN=your_secure_token
```

#### DigitalOcean App Platform
```bash
# In app.yaml
services:
  - name: api
    envs:
      - key: ADMIN_TOKEN
        value: your_secure_token
```

## Generating Secure Admin Tokens

### Option 1: OpenSSL (Recommended)
```bash
openssl rand -hex 32
# Output: a1b2c3d4e5f6...
```

### Option 2: Python
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Option 3: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 4: Online Generator
Use a password manager or https://www.random.org/strings/

**Recommended length:** 32-64 characters

## Complete Deployment Example

### Docker Compose (Production)

1. **Clone the repository:**
```bash
git clone https://github.com/yourorg/fakecarrier.git
cd fakecarrier
```

2. **Create .env file:**
```bash
cat > .env << EOF
# Database
DATABASE_URL=postgresql://fakecarrier:$(openssl rand -hex 16)@db:5432/fakecarrier
POSTGRES_USER=fakecarrier
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=fakecarrier

# Admin (CHANGE THIS!)
ADMIN_TOKEN=$(openssl rand -hex 32)

# Privacy
PRIVACY_MODE=true

# AI Enhancement
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EOF
```

3. **Start services:**
```bash
docker compose up -d
```

4. **Save your admin token:**
```bash
echo "Your admin token is:"
grep ADMIN_TOKEN .env | cut -d= -f2
```

**Important:** Store this token securely (password manager, secrets vault, etc.)

### Kubernetes Deployment

1. **Create a Secret:**
```bash
kubectl create secret generic fakecarrier-secrets \
  --from-literal=admin-token=$(openssl rand -hex 32) \
  --from-literal=database-url=postgresql://... \
  --from-literal=gemini-api-key=your_key
```

2. **Reference in Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fakecarrier-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: fakecarrier-api:latest
        env:
        - name: ADMIN_TOKEN
          valueFrom:
            secretKeyRef:
              name: fakecarrier-secrets
              key: admin-token
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: fakecarrier-secrets
              key: database-url
```

### AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name fakecarrier/admin-token \
  --secret-string $(openssl rand -hex 32)

# Retrieve in application
aws secretsmanager get-secret-value \
  --secret-id fakecarrier/admin-token \
  --query SecretString \
  --output text
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_TOKEN` | Admin dashboard access token | `a1b2c3d4e5f6...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis | None (AI disabled) |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.0-flash-exp` |
| `PRIVACY_MODE` | Truncate stored email content | `false` |
| `DOMAIN_AGE_PROVIDER` | Domain age lookup provider | `null` |
| `NEXT_PUBLIC_API_BASE_URL` | API URL for frontend | `http://localhost:8000` |

## Security Best Practices

### 1. Never Commit Secrets
```bash
# .gitignore already includes:
.env
.env.local
.env.production
docker-compose.override.yml
```

### 2. Rotate Tokens Regularly
```bash
# Generate new token
NEW_TOKEN=$(openssl rand -hex 32)

# Update .env
sed -i "s/ADMIN_TOKEN=.*/ADMIN_TOKEN=$NEW_TOKEN/" .env

# Restart services
docker compose restart api
```

### 3. Use Secrets Management
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager
- Kubernetes Secrets

### 4. Restrict Access
```bash
# Set proper file permissions
chmod 600 .env
chown root:root .env
```

### 5. Use HTTPS in Production
```yaml
# docker-compose.yml with Traefik
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com"
    ports:
      - "443:443"
```

## Deployment Checklist

- [ ] Generate secure random admin token (32+ characters)
- [ ] Set `ADMIN_TOKEN` via environment variable
- [ ] Configure `DATABASE_URL` with secure password
- [ ] Set `PRIVACY_MODE=true` for production
- [ ] Add Gemini API key if using AI features
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` to production domain
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up firewall rules
- [ ] Test admin access with new token
- [ ] Document token storage location
- [ ] Set up token rotation schedule

## Accessing Admin Dashboard

After deployment, users access the admin dashboard at:

```
https://yourdomain.com/admin
```

They enter the `ADMIN_TOKEN` you configured (not in the code).

## Troubleshooting

### "Invalid admin token" error

**Cause:** Token mismatch between .env and what you're entering

**Solution:**
```bash
# Check current token
docker compose exec api env | grep ADMIN_TOKEN

# Or check .env file
grep ADMIN_TOKEN .env
```

### Token not updating

**Cause:** Docker Compose cached environment variables

**Solution:**
```bash
# Force recreate containers
docker compose down
docker compose up -d --force-recreate
```

### Can't access admin dashboard

**Cause:** CORS or network configuration

**Solution:**
```bash
# Check API logs
docker compose logs api

# Test API directly
curl -H "X-Admin-Token: your_token" http://localhost:8000/admin/stats
```

## Multi-Tenant Deployment

For multiple customers, each can have their own token:

### Option 1: Separate Instances
```bash
# Customer A
ADMIN_TOKEN=customer_a_token docker compose -p customer-a up -d

# Customer B
ADMIN_TOKEN=customer_b_token docker compose -p customer-b up -d
```

### Option 2: Token Database (Future Enhancement)
Store multiple admin tokens in database with different permissions.

## Updating FakeCarrier

When updating to a new version:

```bash
# Pull latest code
git pull origin main

# Rebuild containers (keeps your .env)
docker compose up -d --build

# Your ADMIN_TOKEN remains unchanged
```

## Support

For deployment issues:
- Check logs: `docker compose logs`
- Verify environment: `docker compose exec api env`
- Test connectivity: `curl http://localhost:8000/`

## Example: Complete Production Setup

```bash
#!/bin/bash
# deploy.sh - Production deployment script

# Generate secure credentials
ADMIN_TOKEN=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://fakecarrier:${DB_PASSWORD}@db:5432/fakecarrier
POSTGRES_USER=fakecarrier
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=fakecarrier
ADMIN_TOKEN=${ADMIN_TOKEN}
PRIVACY_MODE=true
GEMINI_API_KEY=${GEMINI_API_KEY}
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EOF

# Secure the file
chmod 600 .env

# Deploy
docker compose up -d

# Save credentials securely
echo "Admin Token: ${ADMIN_TOKEN}" | gpg --encrypt --recipient admin@yourdomain.com > admin-token.gpg

echo "Deployment complete!"
echo "Admin dashboard: https://yourdomain.com/admin"
echo "Admin token saved to: admin-token.gpg"
```

## Conclusion

Third parties can deploy FakeCarrier and set their own admin token without ever touching the code by:

1. Setting the `ADMIN_TOKEN` environment variable
2. Using a `.env` file
3. Configuring their cloud platform's environment variables
4. Using secrets management services

The code never contains the actual token - it's always configured at deployment time.
