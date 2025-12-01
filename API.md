# FakeCarrier API Documentation

Complete API reference for the FakeCarrier email security scanner.

## Base URL

```
http://localhost:8000
```

## Authentication

Admin endpoints require an `X-Admin-Token` header:

```
X-Admin-Token: your-admin-token
```

## Endpoints

### Public Endpoints

#### GET /

Health check endpoint.

**Response:**
```json
{
  "message": "FakeCarrier API",
  "version": "1.0.0"
}
```

---

#### POST /scan

Scan an email for phishing and impersonation risks.

**Request Body:**
```json
{
  "sender": "user@example.com",
  "headers": "From: user@example.com\nSubject: Test\n...",
  "body": "Email body content..."
}
```

**Response:**
```json
{
  "risk_level": "medium",
  "score": 45,
  "summary": [
    "No SPF record found for example.com",
    "No DMARC policy found for example.com",
    "Contains urgent language"
  ],
  "signals": {
    "from_domain": "example.com",
    "mx_present": true,
    "spf_present": false,
    "spf_record": null,
    "dmarc_present": false,
    "dmarc_record": null,
    "dkim_present": false,
    "dkim_d_domain": null,
    "reply_to_mismatch": false,
    "return_path_mismatch": false,
    "auth_results": {},
    "domain_age_days": null,
    "urls": [],
    "text_flags": ["urgency"]
  },
  "recommendations": [
    "Verify sender identity through a separate channel before taking action",
    "Be cautious with links and attachments",
    "Sender domain lacks proper email authentication"
  ]
}
```

**Risk Levels:**
- `low`: Score 0-33
- `medium`: Score 34-66
- `high`: Score 67-100

**Status Codes:**
- `200`: Success
- `400`: Invalid input (headers/body too large)
- `422`: Validation error
- `500`: Server error

---

#### POST /report

Report a suspicious email for admin review.

**Request Body:**
```json
{
  "sender": "phisher@example.com",
  "headers": "From: phisher@example.com\n...",
  "body": "Phishing email content...",
  "user_comment": "This looks like a phishing attempt"
}
```

**Response:**
```json
{
  "ok": true,
  "report_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid input
- `422`: Validation error
- `500`: Server error

---

### Admin Endpoints

All admin endpoints require the `X-Admin-Token` header.

#### GET /admin/scans

List all scans with optional filters.

**Query Parameters:**
- `risk_level` (optional): Filter by risk level (low/medium/high)
- `domain` (optional): Filter by domain (partial match)
- `days` (optional): Filter by date (last N days)
- `limit` (optional): Number of results (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```
GET /admin/scans?risk_level=high&limit=50
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "phisher@example.com",
    "from_domain": "example.com",
    "score": 85,
    "risk_level": "high",
    "created_at": "2025-11-27T10:30:00"
  }
]
```

**Status Codes:**
- `200`: Success
- `403`: Invalid or missing admin token

---

#### GET /admin/reports

List all user-submitted reports.

**Query Parameters:**
- `limit` (optional): Number of results (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "spam@example.com",
    "from_domain": "example.com",
    "user_comment": "Obvious phishing",
    "created_at": "2025-11-27T10:30:00"
  }
]
```

**Status Codes:**
- `200`: Success
- `403`: Invalid or missing admin token

---

#### GET /admin/stats

Get aggregate statistics.

**Response:**
```json
{
  "total_scans": 1234,
  "total_reports": 56,
  "risk_distribution": {
    "low": 800,
    "medium": 300,
    "high": 134
  },
  "top_domains": [
    {
      "domain": "example.com",
      "count": 45,
      "avg_score": 62.3
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `403`: Invalid or missing admin token

---

#### GET /admin/export.csv

Export data as CSV.

**Query Parameters:**
- `type` (required): Type of data to export (`scans` or `reports`)

**Example:**
```
GET /admin/export.csv?type=scans
```

**Response:**
CSV file download with appropriate headers.

**Scans CSV Format:**
```
ID,Sender,Domain,Score,Risk Level,Created At
550e8400-...,user@example.com,example.com,45,medium,2025-11-27T10:30:00
```

**Reports CSV Format:**
```
ID,Sender,Domain,Comment,Created At
550e8400-...,spam@example.com,example.com,Phishing,2025-11-27T10:30:00
```

**Status Codes:**
- `200`: Success (CSV download)
- `400`: Invalid type parameter
- `403`: Invalid or missing admin token

---

## Scoring System

### Signals Collected

1. **DNS Records:**
   - MX records presence
   - SPF record presence and content
   - DMARC policy presence and content

2. **Email Authentication:**
   - DKIM signature presence
   - DKIM domain alignment
   - Authentication-Results header parsing

3. **Header Analysis:**
   - Reply-To domain mismatch
   - Return-Path domain mismatch

4. **URL Analysis:**
   - URL shorteners (bit.ly, t.co, etc.)
   - Punycode/internationalized domains
   - Lookalike domains

5. **Text Analysis:**
   - Urgency indicators
   - Threatening language
   - Credential requests
   - Payment/banking references

6. **Domain Age:**
   - Domain registration age (if provider configured)

### Scoring Weights

| Signal | Weight | Description |
|--------|--------|-------------|
| No MX records | 15 | Domain has no mail servers |
| No SPF | 10 | Missing SPF record |
| No DMARC | 10 | Missing DMARC policy |
| No DKIM | 8 | No DKIM signature |
| DKIM mismatch | 12 | DKIM domain doesn't match sender |
| Reply-To mismatch | 8 | Reply-To uses different domain |
| Return-Path mismatch | 5 | Return-Path uses different domain |
| Auth failure | 15 | SPF/DKIM/DMARC failed |
| URL shortener | 5 | Contains shortened URLs |
| Punycode domain | 8 | Contains internationalized domain |
| Lookalike domain | 10 | Domain resembles known brand |
| Urgency | 4 | Urgent language detected |
| Threats | 6 | Threatening language |
| Credential request | 8 | Asks for passwords/credentials |
| Payment request | 5 | References payments/banking |
| Young domain | 10 | Domain less than 30 days old |

**Total possible score:** 100 (capped)

### Risk Level Mapping

- **Low (0-33):** Email appears legitimate
- **Medium (34-66):** Some suspicious indicators
- **High (67-100):** Strong phishing indicators

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "detail": "Headers too large"
}
```

**403 Forbidden:**
```json
{
  "detail": "Invalid or missing admin token"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "sender"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Error processing email"
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. For production:
- Implement rate limiting middleware
- Consider per-IP or per-token limits
- Add rate limit headers to responses

---

## CORS

The API allows all origins by default. For production:
- Configure specific allowed origins
- Restrict to your frontend domain
- Update CORS settings in `api/app/main.py`

---

## Interactive Documentation

Visit `/docs` for interactive Swagger UI documentation:
```
http://localhost:8000/docs
```

Visit `/redoc` for ReDoc documentation:
```
http://localhost:8000/redoc
```

---

## Examples

### cURL Examples

**Scan an email:**
```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test@example.com",
    "headers": "From: test@example.com\nSubject: Test",
    "body": "Test email body"
  }'
```

**Get admin stats:**
```bash
curl http://localhost:8000/admin/stats \
  -H "X-Admin-Token: your-token"
```

**Export scans:**
```bash
curl http://localhost:8000/admin/export.csv?type=scans \
  -H "X-Admin-Token: your-token" \
  -o scans.csv
```

### Python Examples

```python
import requests

# Scan email
response = requests.post('http://localhost:8000/scan', json={
    'sender': 'test@example.com',
    'headers': 'From: test@example.com\nSubject: Test',
    'body': 'Test email body'
})
result = response.json()
print(f"Risk: {result['risk_level']}, Score: {result['score']}")

# Get admin stats
response = requests.get(
    'http://localhost:8000/admin/stats',
    headers={'X-Admin-Token': 'your-token'}
)
stats = response.json()
print(f"Total scans: {stats['total_scans']}")
```

### JavaScript Examples

```javascript
// Scan email
const response = await fetch('http://localhost:8000/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender: 'test@example.com',
    headers: 'From: test@example.com\nSubject: Test',
    body: 'Test email body'
  })
});
const result = await response.json();
console.log(`Risk: ${result.risk_level}, Score: ${result.score}`);
```

---

## Privacy Mode

When `PRIVACY_MODE=true`:
- Headers truncated to first 1000 characters
- Body truncated to first 1000 characters
- Full content still analyzed, only storage is affected
- Helps comply with data retention policies

---

## Future Enhancements

Potential API improvements:
- Batch scanning endpoint
- Webhook notifications
- Real-time scanning via WebSocket
- Machine learning model integration
- Historical trend analysis
- Custom rule configuration
- API key management
- Rate limiting per key
