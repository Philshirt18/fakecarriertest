# FakeCarrier Setup Guide

Complete setup instructions for the FakeCarrier email security scanner.

## Quick Start (Docker)

The fastest way to get started:

```bash
# 1. Clone/download the repository
cd fakecarrier

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env and set a secure ADMIN_TOKEN
nano .env  # or use your preferred editor

# 4. Start all services
docker compose up --build

# 5. Access the application
# Web UI: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Manual Setup (Development)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+

### Backend Setup

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost:5432/fakecarrier"
export ADMIN_TOKEN="your-secure-token"

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"

# Start development server
npm run dev
```

The web app will be available at http://localhost:3000

### Database Setup

If using PostgreSQL locally:

```bash
# Create database
createdb fakecarrier

# Or using psql
psql -U postgres
CREATE DATABASE fakecarrier;
CREATE USER fakecarrier WITH PASSWORD 'fakecarrier_pass';
GRANT ALL PRIVILEGES ON DATABASE fakecarrier TO fakecarrier;
```

## Testing

### Run API Tests

```bash
cd api
pytest
```

### Test the API Manually

```bash
# Scan an email
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test@example.com",
    "headers": "From: test@example.com\nSubject: Test",
    "body": "This is a test email"
  }'

# Get admin stats (replace TOKEN)
curl http://localhost:8000/admin/stats \
  -H "X-Admin-Token: your-token-here"
```

## Outlook Add-in Setup

See [outlook-addin/README.md](outlook-addin/README.md) for detailed instructions.

Quick steps:
1. Ensure web app is running at http://localhost:3000
2. Open Outlook Desktop or Outlook on the web
3. Go to Get Add-ins > My add-ins > Add from file
4. Select `outlook-addin/manifest.xml`
5. Install and use the add-in

## Production Deployment

### Environment Variables

Required for production:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Security
ADMIN_TOKEN=generate-a-strong-random-token

# Privacy
PRIVACY_MODE=true  # Truncates stored email content

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Docker Compose Production

```bash
# Edit .env with production values
nano .env

# Start services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Security Checklist

- [ ] Change ADMIN_TOKEN to a strong random value
- [ ] Use HTTPS for all endpoints
- [ ] Configure CORS properly in FastAPI
- [ ] Enable PRIVACY_MODE in production
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Use environment-specific .env files
- [ ] Review and limit API rate limits
- [ ] Set up monitoring and logging

### Scaling Considerations

- Use a managed PostgreSQL service (AWS RDS, Azure Database, etc.)
- Deploy API behind a load balancer
- Use Redis for caching (future enhancement)
- Set up CDN for static assets
- Configure horizontal scaling for API containers

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# View database logs
docker compose logs db

# Connect to database
docker compose exec db psql -U fakecarrier -d fakecarrier
```

### API Not Starting

```bash
# Check API logs
docker compose logs api

# Verify migrations
docker compose exec api alembic current

# Run migrations manually
docker compose exec api alembic upgrade head
```

### Frontend Build Issues

```bash
# Clear Next.js cache
cd web
rm -rf .next node_modules
npm install
npm run build
```

### CORS Errors

If you see CORS errors in the browser:
1. Check NEXT_PUBLIC_API_BASE_URL is correct
2. Verify API CORS settings in `api/app/main.py`
3. Ensure both services are running

## Configuration Options

### API Configuration

Edit `api/app/config.py` or use environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_TOKEN`: Token for admin endpoints
- `PRIVACY_MODE`: Enable content truncation (true/false)
- `DOMAIN_AGE_PROVIDER`: Domain age provider (null/rdap/whois)
- `MAX_HEADER_SIZE`: Max header size in bytes (default: 50000)
- `MAX_BODY_SIZE`: Max body size in bytes (default: 500000)

### Scoring Weights

To adjust risk scoring, edit `api/app/scoring/engine.py` and modify the `WEIGHTS` dictionary.

### DNS Timeout

To adjust DNS lookup timeouts, edit `api/app/scoring/dns_checker.py`:

```python
self.resolver.timeout = 5  # seconds
self.resolver.lifetime = 5  # seconds
```

## Support

For issues and questions:
- Check the logs: `docker compose logs`
- Review API docs: http://localhost:8000/docs
- Check GitHub issues (if applicable)

## License

MIT
