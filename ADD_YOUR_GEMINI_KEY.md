# Quick Start: Add Your Gemini API Key

## Step 1: Get Your Free API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the key (starts with `AIza...`)

## Step 2: Add to FakeCarrier

Open the `.env` file in this directory and find this line:

```bash
GEMINI_API_KEY=
```

Replace it with your actual key:

```bash
GEMINI_API_KEY=AIzaSyYourActualKeyHere123456789
```

Save the file.

## Step 3: Restart the API

```bash
docker compose restart api
```

Wait 5 seconds, then verify:

```bash
docker compose logs api | grep "AI analyzer"
```

You should see:
```
INFO:app.scoring.ai_analyzer:AI analyzer enabled with model: gemini-2.0-flash-exp
```

## Step 4: Test It!

Run a scan with a suspicious email:

```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "security@paypa1-verify.com",
    "headers": "From: security@paypa1-verify.com\nSubject: URGENT: Verify Account",
    "body": "Your PayPal account will be suspended! Click here immediately to verify your password and prevent account closure. This is your final warning!"
  }' | python3 -m json.tool
```

Look for the `ai_analysis` section in the response. If AI is working, you'll see:
- `ai_risk_score`: A number between 0-100
- `ai_flags`: List of detected issues
- `ai_confidence`: How confident the AI is (0.0-1.0)
- `ai_reasoning`: Why the AI thinks it's risky

## That's It!

Your FakeCarrier installation now has AI-powered phishing detection! 🎉

The AI will:
- Detect sophisticated social engineering
- Identify impersonation attempts
- Recognize subtle phishing patterns
- Provide confidence scores
- Add up to +20 points to risk scores for high-confidence detections

## Need Help?

See [GEMINI_SETUP.md](GEMINI_SETUP.md) for detailed documentation.
