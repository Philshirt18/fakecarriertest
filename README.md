# FakeCarrier

Production-ready MVP for email impersonation and phishing risk detection.

## Features

- **Risk Scoring API**: Analyzes email authentication signals (SPF, DKIM, DMARC), headers, and content
- **AI-Powered Detection**: Optional Gemini AI integration for advanced phishing pattern recognition
- **Web Interface**: Simple UI for scanning emails and viewing results
- **Admin Dashboard**: Review scans, reports, stats, and export data
- **Outlook Add-in**: Sideloadable task pane for scanning emails directly in Outlook

## Architecture

- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Outlook Add-in**: Office.js Task Pane
- **Deployment**: Docker Compose

## Quick Start

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration (especially `ADMIN_TOKEN`)

3. Start all services:
```bash
docker compose up --build
```

4. Access the application:
   - Web UI: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - Admin: http://localhost:3000/admin

## Development

### API (Backend)
```bash
cd api
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Web (Frontend)
```bash
cd web
npm install
npm run dev
```

### Testing
```bash
cd api
pytest
```

## Outlook Add-in Setup

See [outlook-addin/README.md](outlook-addin/README.md) for detailed sideloading instructions.

## API Endpoints

### Public
- `POST /scan` - Scan an email for phishing risk
- `POST /report` - Report a suspicious email

### Admin (requires X-Admin-Token header)
- `GET /admin/scans` - List all scans with filters
- `GET /admin/reports` - List all reports
- `GET /admin/stats` - Get statistics
- `GET /admin/export.csv` - Export data as CSV

## AI Enhancement (Optional)

FakeCarrier can use Google's Gemini AI to significantly improve phishing detection accuracy. This is optional but recommended.

**Setup:**
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`
3. Restart: `docker compose restart api`

See [GEMINI_SETUP.md](GEMINI_SETUP.md) for detailed instructions.

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
