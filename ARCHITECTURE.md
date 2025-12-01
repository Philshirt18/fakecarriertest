# FakeCarrier Architecture

Technical architecture and design decisions for the FakeCarrier email security scanner.

## System Overview

FakeCarrier is a production-ready MVP that detects email impersonation and phishing risks using a combination of:
- Email authentication signals (SPF, DKIM, DMARC)
- DNS verification
- Header analysis
- URL extraction and analysis
- Text pattern matching
- Heuristic scoring

## Components

### 1. Backend API (Python/FastAPI)

**Location:** `/api`

**Tech Stack:**
- Python 3.12+
- FastAPI (web framework)
- SQLAlchemy (ORM)
- Alembic (migrations)
- PostgreSQL (database)
- dnspython (DNS lookups)
- Pydantic (validation)

**Structure:**
```
api/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database setup
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── scoring/             # Scoring engine
│       ├── engine.py        # Main scoring logic
│       ├── dns_checker.py   # DNS verification
│       ├── header_parser.py # Header analysis
│       ├── url_extractor.py # URL extraction
│       ├── text_analyzer.py # Text analysis
│       └── domain_age.py    # Domain age provider
├── alembic/                 # Database migrations
├── tests/                   # Test suite
└── requirements.txt         # Dependencies
```

**Key Features:**
- RESTful API with OpenAPI documentation
- Async DNS lookups
- Structured logging
- Input validation and size limits
- Privacy mode for data retention
- Admin authentication via token

### 2. Web Application (Next.js)

**Location:** `/web`

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

**Structure:**
```
web/
├── src/
│   └── app/
│       ├── page.tsx         # Scan interface
│       ├── admin/
│       │   └── page.tsx     # Admin dashboard
│       ├── layout.tsx       # Root layout
│       └── globals.css      # Global styles
├── public/
│   ├── outlook-addin/       # Add-in assets
│   └── icon-*.png           # Icons
└── package.json             # Dependencies
```

**Pages:**
- `/` - Email scanning interface
- `/admin` - Admin dashboard with stats and exports

**Features:**
- Responsive design
- Real-time scanning
- Result visualization
- Report submission
- Admin authentication
- CSV export

### 3. Outlook Add-in (Office.js)

**Location:** `/outlook-addin`

**Tech Stack:**
- Office.js
- Vanilla JavaScript
- HTML/CSS

**Files:**
- `manifest.xml` - Add-in configuration
- `taskpane.html` - Main UI
- `commands.html` - Command handlers

**Features:**
- Sideloadable task pane
- Email content extraction
- Real-time scanning
- Risk visualization

### 4. Database (PostgreSQL)

**Schema:**

**Scans Table:**
```sql
CREATE TABLE scans (
    id UUID PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    from_domain VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    summary JSONB NOT NULL,
    signals JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    headers TEXT,
    body TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_scans_sender ON scans(sender);
CREATE INDEX idx_scans_domain ON scans(from_domain);
CREATE INDEX idx_scans_risk ON scans(risk_level);
CREATE INDEX idx_scans_created ON scans(created_at);
```

**Reports Table:**
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    from_domain VARCHAR(255) NOT NULL,
    user_comment TEXT,
    headers TEXT,
    body TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_reports_sender ON reports(sender);
CREATE INDEX idx_reports_domain ON reports(from_domain);
CREATE INDEX idx_reports_created ON reports(created_at);
```

## Scoring Engine

### Architecture

The scoring engine uses a modular, pluggable design:

```
ScoringEngine
├── DNSChecker        # DNS record verification
├── HeaderParser      # Email header analysis
├── URLExtractor      # URL extraction and analysis
├── TextAnalyzer      # Content pattern matching
└── DomainAgeProvider # Domain age lookup (pluggable)
```

### Scoring Flow

1. **Input Validation**
   - Validate email format
   - Check size limits
   - Sanitize inputs

2. **Signal Collection**
   - DNS lookups (MX, SPF, DMARC)
   - Header parsing (DKIM, Reply-To, Return-Path)
   - URL extraction and analysis
   - Text pattern matching
   - Domain age lookup (if configured)

3. **Score Calculation**
   - Apply weights to each signal
   - Sum weighted scores
   - Cap at 100

4. **Risk Classification**
   - 0-33: Low risk
   - 34-66: Medium risk
   - 67-100: High risk

5. **Recommendation Generation**
   - Generate actionable tips based on signals
   - Prioritize by risk level

### Extensibility

**Adding New Signals:**
1. Add detection logic to appropriate module
2. Add weight to `WEIGHTS` dictionary
3. Update scoring logic in `_calculate_score`
4. Add to signals output

**Custom Domain Age Provider:**
```python
class RDAPDomainAgeProvider(DomainAgeProvider):
    async def get_domain_age_days(self, domain: str) -> Optional[int]:
        # Implement RDAP lookup
        pass

# Register in domain_age.py
def get_domain_age_provider(provider_name: str):
    if provider_name == "rdap":
        return RDAPDomainAgeProvider()
```

## Data Flow

### Scan Request Flow

```
User/Add-in
    ↓
Web UI / Outlook Add-in
    ↓ POST /scan
API (FastAPI)
    ↓
ScoringEngine
    ├→ DNSChecker (async DNS lookups)
    ├→ HeaderParser (parse headers)
    ├→ URLExtractor (extract & analyze URLs)
    ├→ TextAnalyzer (pattern matching)
    └→ DomainAgeProvider (optional)
    ↓
Calculate Score & Risk Level
    ↓
Store in Database
    ↓
Return Results
    ↓
Display in UI
```

### Admin Dashboard Flow

```
Admin User
    ↓
Web UI (/admin)
    ↓ GET /admin/scans (with X-Admin-Token)
API (FastAPI)
    ↓ verify_admin_token()
Database Query
    ↓
Return Results
    ↓
Display in Dashboard
```

## Security Considerations

### Authentication
- Admin endpoints protected by token
- Token passed via header (not URL)
- Token stored in environment variable

### Input Validation
- Email format validation
- Size limits on headers/body
- SQL injection prevention (SQLAlchemy ORM)
- XSS prevention (React escaping)

### Privacy
- Optional privacy mode
- Content truncation for storage
- No PII in logs
- Configurable data retention

### CORS
- Configurable allowed origins
- Credentials support
- Preflight handling

## Performance

### Optimization Strategies

1. **Async DNS Lookups**
   - Non-blocking DNS queries
   - Timeout configuration
   - Parallel lookups

2. **Database Indexing**
   - Indexes on frequently queried fields
   - JSONB indexing for signals

3. **Connection Pooling**
   - SQLAlchemy connection pool
   - PostgreSQL connection limits

4. **Caching (Future)**
   - DNS result caching
   - Domain reputation caching
   - Redis integration

### Scalability

**Horizontal Scaling:**
- Stateless API design
- Load balancer compatible
- Shared database

**Vertical Scaling:**
- Increase worker processes
- Adjust database resources
- Optimize query performance

## Deployment

### Docker Compose

**Services:**
- `db` - PostgreSQL database
- `api` - FastAPI backend
- `web` - Next.js frontend

**Volumes:**
- `postgres_data` - Persistent database storage

**Networks:**
- Default bridge network
- Service discovery via service names

### Environment Configuration

**Development:**
```
DATABASE_URL=postgresql://localhost:5432/fakecarrier
ADMIN_TOKEN=dev-token
PRIVACY_MODE=false
```

**Production:**
```
DATABASE_URL=postgresql://prod-host:5432/fakecarrier
ADMIN_TOKEN=<strong-random-token>
PRIVACY_MODE=true
```

## Monitoring & Logging

### Logging

**API Logging:**
- Structured JSON logs
- Request/response logging
- Error tracking
- Performance metrics

**Log Levels:**
- INFO: Normal operations
- WARNING: Recoverable issues
- ERROR: Failures requiring attention

### Metrics (Future)

Potential metrics to track:
- Scan requests per minute
- Average scan duration
- DNS lookup latency
- Database query performance
- Error rates
- Risk level distribution

## Testing Strategy

### Unit Tests
- Scoring engine components
- DNS checker
- Header parser
- URL extractor
- Text analyzer

### Integration Tests
- API endpoints
- Database operations
- End-to-end scan flow

### Manual Testing
- Web UI functionality
- Admin dashboard
- Outlook add-in
- CSV export

## Future Enhancements

### Short Term
1. Rate limiting
2. API key management
3. Webhook notifications
4. Batch scanning

### Medium Term
1. Machine learning integration
2. Real-time threat intelligence
3. Custom rule engine
4. Advanced reporting

### Long Term
1. Multi-tenant support
2. SaaS deployment
3. Mobile app
4. Browser extension

## Technology Choices

### Why FastAPI?
- Modern async support
- Automatic OpenAPI docs
- Type safety with Pydantic
- High performance
- Easy testing

### Why Next.js?
- Server-side rendering
- API routes
- TypeScript support
- Great developer experience
- Production-ready

### Why PostgreSQL?
- JSONB support for flexible data
- Robust indexing
- ACID compliance
- Mature ecosystem
- Scalable

### Why Docker Compose?
- Simple local development
- Consistent environments
- Easy deployment
- Service orchestration
- Volume management

## Code Quality

### Standards
- Type hints in Python
- TypeScript in frontend
- Consistent formatting
- Meaningful variable names
- Comprehensive comments

### Best Practices
- Separation of concerns
- DRY principle
- SOLID principles
- Error handling
- Input validation

## Maintenance

### Regular Tasks
- Update dependencies
- Review logs
- Monitor performance
- Backup database
- Security patches

### Database Maintenance
- Regular backups
- Index optimization
- Query performance review
- Data retention policies

## Support & Documentation

- README.md - Quick start guide
- SETUP.md - Detailed setup instructions
- API.md - API documentation
- ARCHITECTURE.md - This document
- outlook-addin/README.md - Add-in setup

## License

MIT License - See LICENSE file for details
