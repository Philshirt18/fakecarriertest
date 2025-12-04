# FakeCarrier Improvement Plan

## 1. Simplified User Flow - Email-Only Verification

### Current State:
- User must enter: Email address, Headers, Body
- All fields required

### New State:
- **Primary Input**: Email address (required)
- **Optional**: Headers and Body (for deeper analysis)

### Basic Checks (Email Only):
When user enters just an email, system checks:
- ✅ Domain age & reputation
- ✅ Public vs professional domain
- ✅ MX / SPF / DKIM / DMARC records
- ✅ Known scam patterns (domain blacklists)
- ✅ Load board presence (Timocom, Teleroute, B2PWeb)
- ✅ Historical scan data
- ✅ Risk score calculation

### Enhanced Checks (With Headers/Body):
- All basic checks +
- Email authentication results
- Content analysis (urgency, threats, credential requests)
- URL analysis
- AI-powered phishing detection

---

## 2. Color-Coded Result Display

### Visual Indicator at Top:
```
┌─────────────────────────────────────┐
│  🟢 SAFE - Verified Carrier         │
│  Risk Score: 15/100                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🟡 MEDIUM RISK - Verify Identity   │
│  Risk Score: 45/100                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🔴 HIGH RISK - Likely Fraud        │
│  Risk Score: 85/100                 │
└─────────────────────────────────────┘
```

### Implementation:
- Large, prominent banner at top of results
- Color-coded background (green/yellow/red)
- Clear text status
- Risk score displayed prominently

---

## 3. "Report FakeCarrier" Feature

### User Interface:
```
┌─────────────────────────────────────┐
│ ⚠️ Report this as FakeCarrier Fraud │
│                                     │
│ [ ] This email is related to        │
│     FakeCarrier fraud               │
│                                     │
│ [Optional Comment]                  │
│ ________________________________    │
│                                     │
│ [Submit Report]                     │
└─────────────────────────────────────┘
```

### Backend:
- Store reports in database
- Link to scan results
- Track patterns
- Improve AI training data
- Admin dashboard shows reported emails

### Database Schema:
```sql
CREATE TABLE fraud_reports (
    id UUID PRIMARY KEY,
    scan_id UUID REFERENCES scans(id),
    email_address VARCHAR(255),
    user_comment TEXT,
    reported_at TIMESTAMP,
    ip_address VARCHAR(45)
);
```

---

## 4. Public vs Professional Domain Detection

### Detection Logic:
```python
PUBLIC_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'mail.com', 'gmx.com',
    'protonmail.com', 'yandex.com', 'zoho.com'
]

def is_public_domain(email: str) -> bool:
    domain = email.split('@')[1].lower()
    return domain in PUBLIC_DOMAINS
```

### Display Messages:
```
🔴 Public Domain Detected (Gmail)
   → Higher fraud risk
   → Professional carriers use company domains
   → Verify identity through other channels

🟢 Professional Domain Detected (example-transport.de)
   → Lower fraud risk
   → Company-owned email address
   → Still verify through load boards
```

### Scoring Impact:
- Public domain: +20 risk points
- Professional domain: +0 risk points
- New domain (<30 days) + public: +35 risk points

---

## 5. Load Board Verification Integration

### Technical Implementation:

#### Step 1: Contact Load Board Providers

**Timocom (Germany)**
- Website: https://www.timocom.com
- Contact: API/Developer Relations
- Ask for: Email/Domain verification API access

**Teleroute (France)**
- Website: https://www.teleroute.com
- Contact: Technical Support / API Team
- Ask for: Member verification API

**B2PWeb (Belgium)**
- Website: https://www.b2pweb.com
- Contact: Developer Support
- Ask for: Carrier verification API

#### Questions to Ask:

1. **API Availability**
   - "Do you provide an API to verify if an email address or company is registered?"
   - "What endpoints are available for verification?"

2. **Authentication**
   - "What authentication method do you use?" (API Key, OAuth2, etc.)
   - "How do we obtain API credentials?"

3. **Rate Limits & Pricing**
   - "What are the rate limits?"
   - "What is the pricing structure?" (per call, monthly subscription, etc.)
   - "Is there a free tier for testing?"

4. **Data Returned**
   - "What information is returned?" (just yes/no or company details)
   - "Can we get company name, registration date, verification status?"

5. **Compliance**
   - "Is this GDPR compliant?"
   - "What data privacy measures are in place?"

#### Step 2: API Integration Architecture

**File Structure:**
```
api/app/verification/
├── __init__.py
├── load_boards.py          # Main integration
├── timocom.py             # Timocom API client
├── teleroute.py           # Teleroute API client
├── b2pweb.py              # B2PWeb API client
└── models.py              # Data models
```

**Implementation Example:**

```python
# api/app/verification/load_boards.py

from typing import Dict, List
import httpx
from app.config import settings

class LoadBoardVerifier:
    """Verify email/company registration on load boards"""
    
    def __init__(self):
        self.timocom_api_key = settings.timocom_api_key
        self.teleroute_api_key = settings.teleroute_api_key
        self.b2pweb_api_key = settings.b2pweb_api_key
    
    async def check_timocom(self, email: str) -> Dict:
        """Check if email is registered on Timocom"""
        if not self.timocom_api_key:
            return {"status": "unknown", "reason": "API key not configured"}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.timocom.com/v1/verify/email",
                    params={"email": email},
                    headers={"Authorization": f"Bearer {self.timocom_api_key}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "platform": "Timocom",
                        "status": "registered" if data.get("registered") else "not_registered",
                        "company_name": data.get("company_name"),
                        "verified_since": data.get("member_since"),
                        "verification_level": data.get("verification_level")
                    }
                elif response.status_code == 404:
                    return {"platform": "Timocom", "status": "not_registered"}
                else:
                    return {"platform": "Timocom", "status": "unknown", "reason": "API error"}
        except Exception as e:
            return {"platform": "Timocom", "status": "unknown", "reason": str(e)}
    
    async def check_teleroute(self, email: str) -> Dict:
        """Check if email is registered on Teleroute"""
        # Similar implementation
        pass
    
    async def check_b2pweb(self, email: str) -> Dict:
        """Check if email is registered on B2PWeb"""
        # Similar implementation
        pass
    
    async def verify_all(self, email: str) -> Dict:
        """Check all load boards and return consolidated results"""
        results = await asyncio.gather(
            self.check_timocom(email),
            self.check_teleroute(email),
            self.check_b2pweb(email)
        )
        
        registered = []
        not_registered = []
        unknown = []
        
        for result in results:
            platform = result.get("platform")
            status = result.get("status")
            
            if status == "registered":
                registered.append({
                    "platform": platform,
                    "company_name": result.get("company_name"),
                    "verified_since": result.get("verified_since")
                })
            elif status == "not_registered":
                not_registered.append(platform)
            else:
                unknown.append(platform)
        
        return {
            "registered": registered,
            "not_registered": not_registered,
            "unknown": unknown,
            "summary": self._generate_summary(registered, not_registered, unknown)
        }
    
    def _generate_summary(self, registered, not_registered, unknown) -> str:
        if registered:
            platforms = ", ".join([r["platform"] for r in registered])
            return f"✓ Registered on: {platforms}"
        elif not_registered and not unknown:
            return "✗ Not registered on any load board"
        else:
            return "? Unable to verify load board registration"
```

#### Step 3: Display in Results

```
┌─────────────────────────────────────────────┐
│ Load Board Verification                     │
├─────────────────────────────────────────────┤
│ ✓ Registered on Timocom                     │
│   Company: Example Transport GmbH           │
│   Member since: 2020                        │
│                                             │
│ ✗ Not registered on Teleroute              │
│ ? B2PWeb verification unavailable           │
└─────────────────────────────────────────────┘
```

#### Step 4: Scoring Impact

```python
# In scoring engine
if load_board_results["registered"]:
    score -= 15  # Reduce risk if registered
    reasons.append("Registered on verified load boards")
elif load_board_results["not_registered"]:
    score += 20  # Increase risk if not registered
    reasons.append("Not registered on any load boards")
```

---

## Alternative: Manual Load Board Database

If APIs are not available or too expensive:

### Option A: Scraping (Legal Considerations)
- Check terms of service
- May violate ToS
- Not recommended

### Option B: Manual Database
- Build internal database of verified carriers
- Users can submit verified carriers
- Admin approval process
- Community-driven verification

### Option C: Hybrid Approach
- Start with manual database
- Add API integration when available
- Use both sources for verification

---

## Implementation Priority

### Phase 1 (Week 1):
1. ✅ Simplify UI - email-only input
2. ✅ Public vs professional domain detection
3. ✅ Color-coded result display
4. ✅ "Report FakeCarrier" button

### Phase 2 (Week 2):
1. Contact load board providers
2. Obtain API access/documentation
3. Implement load board integration
4. Test and refine

### Phase 3 (Week 3):
1. Historical scan tracking
2. Enhanced reporting dashboard
3. AI training on reported fraud
4. Performance optimization

---

## Cost Estimates

### Load Board API Access:
- **Timocom**: €50-200/month (estimated)
- **Teleroute**: €50-150/month (estimated)
- **B2PWeb**: €30-100/month (estimated)
- **Total**: €130-450/month

### Alternative:
- Build manual database: €0/month
- Community verification: €0/month
- Hybrid approach: €50-150/month (1-2 APIs)

---

## Next Steps

1. **Immediate**: I can implement Phase 1 improvements now
2. **This Week**: You contact load board providers for API access
3. **Next Week**: I integrate load board APIs once you have credentials
4. **Ongoing**: Refine based on user feedback

Would you like me to start implementing Phase 1 improvements now?
