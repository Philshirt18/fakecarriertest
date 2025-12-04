# What's New in FakeCarrier v1.2.0

## 🎉 Major Updates - December 4, 2025

### Phase 3: Enhanced Analytics Dashboard ✨ NEW!

We've added a powerful new analytics dashboard to help you understand threat patterns and trends.

**Access it at:** `/admin/analytics`

#### Features:

**1. Timeline Visualization**
- See scan activity over time with color-coded risk levels
- Visual breakdown of Safe, Low, Medium, and High-risk scans
- Configurable time ranges: 7, 14, 30, or 90 days
- Easy-to-read stacked bar charts

**2. High-Risk Monitoring**
- Real-time feed of recent high-risk scans
- Shows sender, domain, risk score, and key findings
- Helps identify active threats quickly
- Sortable by score and date

**3. Trending Domains**
- Identifies domains with increasing scan activity
- Shows scan count and average risk score
- Helps spot emerging threats
- Ranked by activity level

**4. New API Endpoints**
- `GET /admin/timeline?days=30` - Time-series data
- `GET /admin/domain-reputation?domain=example.com` - Domain history
- `GET /admin/high-risk?days=7` - Recent threats
- `GET /admin/trending-domains?days=7` - Activity trends

#### Use Cases:

- **Security Teams**: Monitor threat landscape in real-time
- **Analysts**: Identify patterns and emerging threats
- **Managers**: Track security metrics and trends
- **Investigators**: Research domain reputation and history

---

### Phase 1: User Experience Improvements (Previously Released)

**Simplified Scanning**
- Email address is now the only required field
- Headers and body are optional for deeper analysis
- Faster workflow for quick checks

**Public Domain Detection**
- Automatically flags Gmail, Yahoo, Outlook, etc.
- +20 risk penalty for consumer email services
- Professional carriers should use company domains

**Color-Coded Results**
- Large prominent banners (green/yellow/red)
- Clear visual risk indicators
- Easy to understand at a glance

**Report FakeCarrier Button**
- One-click fraud reporting
- Optional comments for context
- Helps improve detection over time

**Enhanced Risk Levels**
- Added "Safe" level for truly legitimate emails
- Refined thresholds for better accuracy
- Clear explanations for each level

---

## 📊 Analytics Dashboard Guide

### Getting Started

1. Navigate to `/admin` and log in
2. Click the "📊 Analytics" button in the header
3. Select your desired time range (7, 14, 30, or 90 days)
4. Explore the visualizations

### Understanding the Timeline

The timeline shows daily scan activity with color-coded bars:
- **Green (Teal)**: Safe emails
- **Yellow**: Low-risk emails
- **Orange**: Medium-risk emails
- **Red**: High-risk emails

Hover over bars to see exact counts.

### High-Risk Scans

This section shows the most dangerous emails scanned recently:
- **Score**: Risk score out of 100
- **Risk Level**: HIGH or MEDIUM
- **Summary**: Key findings from the scan
- **Date**: When the scan occurred

Use this to:
- Identify active phishing campaigns
- Track repeat offenders
- Investigate suspicious patterns

### Trending Domains

Domains are ranked by scan activity:
- **#1, #2, #3**: Most scanned domains
- **Scan Count**: How many times scanned
- **Avg Score**: Average risk score
- **Last Scan**: Most recent activity

Use this to:
- Spot emerging threats
- Identify frequently impersonated domains
- Track domain reputation over time

---

## 🔧 Technical Details

### New Database Queries

The analytics dashboard uses optimized SQL queries with:
- Date-based filtering
- Aggregation functions
- Indexed lookups
- Efficient grouping

### Performance

- Timeline: ~100-500ms for 30 days
- High-Risk: ~50-200ms for 50 scans
- Trending: ~100-300ms for 20 domains

All queries are optimized for production use.

### API Response Format

**Timeline:**
```json
{
  "timeline": {
    "2025-12-01": {"safe": 10, "low": 5, "medium": 2, "high": 1},
    "2025-12-02": {"safe": 15, "low": 3, "medium": 1, "high": 0}
  }
}
```

**High-Risk Scans:**
```json
[
  {
    "id": "uuid",
    "sender": "scam@example.com",
    "from_domain": "example.com",
    "score": 85,
    "risk_level": "high",
    "summary": ["No mail server", "Public domain"],
    "created_at": "2025-12-04T10:30:00Z"
  }
]
```

**Trending Domains:**
```json
[
  {
    "domain": "suspicious.com",
    "scan_count": 25,
    "avg_score": 67.5,
    "last_scan": "2025-12-04T15:45:00Z"
  }
]
```

---

## 🚀 What's Next?

### Phase 2: Load Board Integration (In Progress)

We're working on integrating with freight load boards:
- Timocom (Germany)
- Teleroute (France)
- B2PWeb (Belgium)

This will verify if email senders are registered carriers.

**Status**: Waiting for API access from providers

### Future Enhancements

- **Email Alerts**: Get notified of high-risk scans
- **Webhooks**: Integrate with your security tools
- **Custom Reports**: Generate PDF reports
- **API Keys**: Programmatic access for developers
- **Team Features**: Multi-user support with roles

---

## 📈 Upgrade Notes

### For Existing Users

No action required! The new features are automatically available:

1. **Analytics Dashboard**: Access via `/admin/analytics`
2. **New API Endpoints**: Available immediately
3. **Database**: No migrations needed (uses existing tables)

### For Developers

If you're running a custom deployment:

1. Pull the latest code: `git pull origin main`
2. Restart services: `docker compose restart`
3. Test analytics: Visit `/admin/analytics`

No database migrations or configuration changes required.

---

## 🐛 Bug Fixes & Improvements

- Improved admin dashboard header layout
- Added analytics link to admin navigation
- Optimized database queries for better performance
- Enhanced error handling in analytics endpoints
- Better mobile responsiveness for analytics page

---

## 📞 Support

Need help?
- **Documentation**: See `PROJECT_STATUS.md` and `API.md`
- **Issues**: Check logs with `docker compose logs`
- **API Docs**: Visit `http://localhost:8000/docs`

---

## 🎯 Summary

**What's New:**
- ✅ Analytics Dashboard with timeline, high-risk monitoring, and trending domains
- ✅ 4 new API endpoints for advanced analytics
- ✅ Configurable time ranges (7-90 days)
- ✅ Real-time threat intelligence
- ✅ Domain reputation tracking

**What's Improved:**
- Better admin navigation
- Optimized database queries
- Enhanced visualizations
- Faster insights

**Version:** 1.2.0  
**Release Date:** December 4, 2025  
**Status:** Production Ready ✅

---

Enjoy the new analytics features! 🎉
