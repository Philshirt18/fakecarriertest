#!/bin/bash

# FakeCarrier API Test Script

API_URL="${API_URL:-http://localhost:8000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-change_this_secure_token_in_production}"

echo "Testing FakeCarrier API at $API_URL"
echo "========================================"
echo ""

# Test 1: Health check
echo "1. Testing root endpoint..."
curl -s "$API_URL/" | jq .
echo ""

# Test 2: Scan a suspicious email
echo "2. Testing scan endpoint with suspicious email..."
curl -s -X POST "$API_URL/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "admin@suspicious-domain.com",
    "headers": "From: admin@suspicious-domain.com\nSubject: URGENT: Verify Your Account\nReply-To: phisher@different.com\nDKIM-Signature: v=1; d=different.com",
    "body": "URGENT! Your account will be suspended immediately unless you verify your password by clicking here: https://bit.ly/verify123. This is your final warning!"
  }' | jq .
echo ""

# Test 3: Scan a legitimate email
echo "3. Testing scan endpoint with legitimate email..."
curl -s -X POST "$API_URL/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "noreply@github.com",
    "headers": "From: noreply@github.com\nSubject: Your weekly digest\nDKIM-Signature: v=1; d=github.com",
    "body": "Here is your weekly summary of activity on GitHub."
  }' | jq .
echo ""

# Test 4: Submit a report
echo "4. Testing report endpoint..."
curl -s -X POST "$API_URL/report" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "spam@example.com",
    "headers": "From: spam@example.com",
    "body": "This is spam",
    "user_comment": "Obvious phishing attempt"
  }' | jq .
echo ""

# Test 5: Admin endpoints (requires token)
echo "5. Testing admin stats endpoint..."
curl -s "$API_URL/admin/stats" \
  -H "X-Admin-Token: $ADMIN_TOKEN" | jq .
echo ""

echo "6. Testing admin scans endpoint..."
curl -s "$API_URL/admin/scans?limit=5" \
  -H "X-Admin-Token: $ADMIN_TOKEN" | jq .
echo ""

echo "========================================"
echo "Tests completed!"
echo ""
echo "To test the web UI, visit: http://localhost:3000"
echo "To test the admin UI, visit: http://localhost:3000/admin"
echo "To view API docs, visit: $API_URL/docs"
