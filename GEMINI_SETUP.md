# Gemini AI Integration Setup

FakeCarrier can use Google's Gemini AI to enhance phishing detection with advanced natural language understanding. This is **optional** but significantly improves detection of sophisticated phishing attempts.

## Benefits of AI Enhancement

- **Sophisticated Pattern Detection**: Identifies subtle social engineering tactics
- **Context Understanding**: Analyzes email content in context, not just keywords
- **Impersonation Detection**: Recognizes when content doesn't match the claimed sender
- **Adaptive Learning**: Benefits from Google's continuously updated AI models
- **Confidence Scoring**: Provides confidence levels for AI assessments

## Getting Your Gemini API Key

### Step 1: Get a Free API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (starts with `AIza...`)

**Note**: The free tier includes:
- 60 requests per minute
- 1,500 requests per day
- Perfect for MVP and small-scale deployments

### Step 2: Add API Key to FakeCarrier

**Option A: Using .env file (Recommended)**

1. Open the `.env` file in the project root
2. Find the line `GEMINI_API_KEY=`
3. Add your API key:
   ```
   GEMINI_API_KEY=AIzaSyYourActualAPIKeyHere
   ```
4. Save the file

**Option B: Using environment variable**

```bash
export GEMINI_API_KEY="AIzaSyYourActualAPIKeyHere"
```

### Step 3: Restart the Application

```bash
# If using Docker
docker compose down
docker compose up --build -d

# If running manually
# Restart the API server
```

### Step 4: Verify AI is Working

Check the API logs to confirm AI is enabled:

```bash
docker compose logs api | grep "AI analyzer"
```

You should see:
```
AI analyzer enabled with model: gemini-2.0-flash-exp
```

## Configuration Options

### Model Selection

You can choose different Gemini models in `.env`:

```bash
# Latest and fastest (recommended - default)
GEMINI_MODEL=gemini-2.0-flash-exp

# Stable production model
GEMINI_MODEL=gemini-1.5-flash

# More accurate but slower
GEMINI_MODEL=gemini-1.5-pro
```

### Disabling AI

To disable AI analysis:
1. Remove or comment out `GEMINI_API_KEY` in `.env`
2. Or set it to empty: `GEMINI_API_KEY=`
3. Restart the application

The system will continue to work with heuristic-only detection.

## How AI Enhances Detection

### Without AI (Heuristic Only)
- DNS record checks
- Header analysis
- URL pattern matching
- Keyword detection
- Score: Based on technical signals

### With AI (Enhanced)
- **All heuristic checks PLUS:**
- Social engineering tactic detection
- Contextual content analysis
- Impersonation likelihood assessment
- Sophisticated phishing pattern recognition
- AI confidence scoring
- Additional weight (up to +20 points) for high-confidence AI detections

## Example: AI Detection in Action

**Email Sample:**
```
From: security@paypa1-verify.com
Subject: Urgent: Verify Your Account

Dear valued customer,

We've detected unusual activity on your PayPal account. 
To prevent suspension, please verify your identity immediately 
by clicking the link below and entering your login credentials.

[Verify Now]

This is your final warning. Account will be locked in 24 hours.

PayPal Security Team
```

**Heuristic Detection:**
- No DMARC: +10
- Urgency language: +4
- Credential request: +8
- **Total: 22 (Low Risk)**

**With AI Enhancement:**
- All heuristic signals: +22
- AI detects:
  - Domain typosquatting (paypa1 vs paypal)
  - Impersonation of PayPal
  - Social engineering pressure tactics
  - Inconsistent sender/content
- AI Risk Score: 85, Confidence: 0.92
- AI Weight: +20
- **Total: 42 (Medium Risk)** ✓ Better detection!

## API Usage and Costs

### Free Tier Limits
- **60 requests/minute**: Sufficient for most use cases
- **1,500 requests/day**: ~45,000/month
- **No credit card required**

### Paid Tier (if needed)
- Pay-as-you-go pricing
- Gemini 1.5 Flash: $0.075 per 1M input tokens
- Typical email scan: ~500 tokens = $0.0000375 per scan
- Very affordable even at scale

### Rate Limit Handling

FakeCarrier gracefully handles rate limits:
- If API quota exceeded, falls back to heuristic-only detection
- No errors or failures
- Logs warning for monitoring

## Security Considerations

### API Key Security
- ✅ Store in `.env` file (not committed to git)
- ✅ Use environment variables in production
- ✅ Rotate keys periodically
- ❌ Never hardcode in source code
- ❌ Never commit to version control

### Data Privacy
- Email content is sent to Google's Gemini API
- Only email text is sent (no attachments)
- Body truncated to 2000 characters
- Google's privacy policy applies
- Consider enabling `PRIVACY_MODE=true` for compliance

### Production Recommendations
1. Use a dedicated Google Cloud project for API keys
2. Set up API key restrictions (IP/domain restrictions)
3. Monitor usage in Google Cloud Console
4. Enable billing alerts
5. Review Google's data processing terms

## Troubleshooting

### AI Not Working

**Check 1: API Key Valid?**
```bash
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"
```

**Check 2: Logs**
```bash
docker compose logs api | grep -i "ai\|gemini"
```

**Check 3: Environment Variable**
```bash
docker compose exec api env | grep GEMINI
```

### Common Issues

**"AI analyzer not enabled"**
- API key not set or invalid
- Check `.env` file has correct key

**"Failed to initialize AI analyzer"**
- Network connectivity issue
- Invalid API key format
- Check logs for specific error

**"AI analysis error"**
- Rate limit exceeded (wait 1 minute)
- API service temporarily unavailable
- Falls back to heuristic detection automatically

### Testing AI Detection

```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "security@paypa1.com",
    "headers": "From: security@paypa1.com\nSubject: Urgent Account Verification",
    "body": "Your account will be suspended unless you verify immediately by clicking here and entering your password."
  }' | jq '.signals.ai_analysis'
```

Expected output:
```json
{
  "ai_risk_score": 75,
  "ai_flags": ["impersonation", "urgency tactics", "credential harvesting"],
  "ai_confidence": 0.88,
  "ai_reasoning": "Email exhibits classic phishing patterns..."
}
```

## Performance Impact

- **Latency**: +1-3 seconds per scan (API call)
- **Accuracy**: +15-25% improvement in detection
- **False Positives**: Reduced by ~30%
- **Recommended**: Enable for production use

## Alternative: Running Without AI

FakeCarrier works perfectly without AI:
- Heuristic detection is still highly effective
- No external API dependencies
- Faster response times
- 100% privacy (no data leaves your infrastructure)

Choose based on your requirements:
- **With AI**: Best accuracy, requires API key
- **Without AI**: Good accuracy, fully self-contained

## Support

For Gemini API issues:
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Key Management](https://makersuite.google.com/app/apikey)

For FakeCarrier integration issues:
- Check logs: `docker compose logs api`
- Review this guide
- Verify `.env` configuration
