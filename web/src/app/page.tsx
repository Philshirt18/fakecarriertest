'use client'

import { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface ScanResult {
  risk_level: string
  score: number
  summary: string[]
  signals: any
  recommendations: string[]
}

export default function Home() {
  const [sender, setSender] = useState('')
  const [headers, setHeaders] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportComment, setReportComment] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)

  // Check if setup is required on mount
  useState(() => {
    fetch(`${API_BASE_URL}/`)
      .then(res => res.json())
      .then(data => {
        if (data.setup_required) {
          setSetupRequired(true)
        }
      })
      .catch(() => {})
  })

  const handleScan = async () => {
    if (!sender || !headers || !body) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, headers, body })
      })

      if (!response.ok) {
        throw new Error('Scan failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to scan email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, headers, body, user_comment: reportComment })
      })

      if (response.ok) {
        setReportSuccess(true)
        setTimeout(() => {
          setShowReport(false)
          setReportSuccess(false)
          setReportComment('')
        }, 2000)
      }
    } catch (err) {
      setError('Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  const copyResults = () => {
    if (!result) return
    
    const text = `FakeCarrier Email Security Scan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Level: ${result.risk_level.toUpperCase()}
Risk Score: ${result.score}/100

Key Findings:
${result.summary.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Recommendations:
${result.recommendations.map((item, i) => `• ${item}`).join('\n')}

Technical Signals:
• Domain: ${result.signals.from_domain}
• MX Records: ${result.signals.mx_present ? 'Present' : 'Missing'}
• SPF: ${result.signals.spf_present ? 'Present' : 'Missing'}
• DMARC: ${result.signals.dmarc_present ? 'Present' : 'Missing'}
• DKIM: ${result.signals.dkim_present ? 'Present' : 'Missing'}
${result.signals.ai_analysis?.ai_risk_score > 0 ? `• AI Risk Score: ${result.signals.ai_analysis.ai_risk_score}/100` : ''}

Scanned by FakeCarrier - https://fakecarrier.com`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          label: 'Low Risk',
          color: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: '⚠️',
          description: 'Some concerns detected'
        }
      case 'medium':
        return {
          label: 'Medium Risk',
          color: 'bg-orange-50 text-orange-900 border-orange-200',
          icon: '⚠️',
          description: 'Multiple suspicious indicators'
        }
      case 'high':
        return {
          label: 'High Risk',
          color: 'bg-red-50 text-red-900 border-red-200',
          icon: '🚨',
          description: 'Strong phishing indicators'
        }
      default:
        return {
          label: 'Secured',
          color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          icon: '✓',
          description: 'Email appears legitimate'
        }
    }
  }

  const riskConfig = result ? getRiskConfig(result.risk_level) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`${API_BASE_URL}/static/logo.png?v=2`}
                alt="FakeCarrier Logo" 
                className="h-32 md:h-40 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-4 absolute right-4 sm:right-6 lg:right-8">
              <a 
                href="/setup" 
                className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors font-semibold shadow-md"
              >
                Settings
              </a>
              <a 
                href="/admin" 
                className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mb-2">
              FakeCarrier
            </h2>
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"></div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Email Security Verification
          </h3>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Detect phishing and impersonation attempts with AI-powered analysis of email authentication signals
          </p>
        </div>

        {/* Scan Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Sender Email Address
              </label>
              <input
                type="email"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                placeholder="sender@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Email Headers
              </label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent font-mono text-sm transition-all"
                rows={6}
                placeholder="From: sender@example.com&#10;Subject: Email subject&#10;Date: ..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Email Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                rows={8}
                placeholder="Email content..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full bg-secondary text-white py-4 px-6 rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scanning...
                </span>
              ) : (
                'Scan Email'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && riskConfig && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            {/* Risk Badge */}
            <div className="text-center pb-8 border-b border-gray-200">
              <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full border-2 ${riskConfig.color} text-lg font-semibold mb-4`}>
                <span className="text-2xl">{riskConfig.icon}</span>
                <span>{riskConfig.label}</span>
              </div>
              <p className="text-gray-600 mt-2">{riskConfig.description}</p>
              
              {/* Score Bar */}
              <div className="max-w-md mx-auto mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
                  <span className="text-2xl font-bold text-primary">{result.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      result.score <= 33 ? 'bg-emerald-500' :
                      result.score <= 66 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Combined score from technical checks and AI content analysis
                </p>
              </div>
            </div>

            {/* Key Findings */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Key Findings</h3>
              <ul className="space-y-3">
                {result.summary.map((item, i) => (
                  <li key={i} className="flex items-start text-primary">
                    <span className="text-secondary mr-3 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Recommended Actions</h3>
              <ul className="space-y-3">
                {result.recommendations.map((item, i) => (
                  <li key={i} className="flex items-start text-primary">
                    <span className="text-accent mr-3 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Details */}
            <details className="border border-gray-200 rounded-lg">
              <summary className="px-6 py-4 cursor-pointer font-medium text-primary hover:bg-gray-50 transition-colors rounded-lg">
                Technical Details
              </summary>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Domain:</span>
                    <span className="ml-2 text-gray-600">{result.signals.from_domain}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">MX Records:</span>
                    <span className="ml-2 text-gray-600">{result.signals.mx_present ? '✓ Present' : '✗ Missing'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">SPF:</span>
                    <span className="ml-2 text-gray-600">{result.signals.spf_present ? '✓ Present' : '✗ Missing'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">DMARC:</span>
                    <span className="ml-2 text-gray-600">{result.signals.dmarc_present ? '✓ Present' : '✗ Missing'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">DKIM:</span>
                    <span className="ml-2 text-gray-600">{result.signals.dkim_present ? '✓ Present' : '✗ Missing'}</span>
                  </div>
                  {result.signals.ai_analysis?.ai_risk_score > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">AI Content Analysis:</span>
                      <span className="ml-2 text-gray-600">{result.signals.ai_analysis.ai_risk_score}/100 risk</span>
                    </div>
                  )}
                </div>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={copyResults}
                className="flex-1 bg-white border-2 border-secondary text-secondary py-3 px-6 rounded-lg hover:bg-secondary hover:text-white font-semibold transition-all"
              >
                {copied ? '✓ Copied!' : 'Copy Results'}
              </button>
              
              {!showReport ? (
                <button
                  onClick={() => setShowReport(true)}
                  className="flex-1 bg-white border-2 border-orange-500 text-orange-600 py-3 px-6 rounded-lg hover:bg-orange-500 hover:text-white font-semibold transition-all"
                >
                  Report This Email
                </button>
              ) : null}
            </div>

            {/* Report Form */}
            {showReport && (
              <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
                <h3 className="font-semibold text-primary mb-3">Report Suspicious Email</h3>
                <textarea
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Optional: Add any additional comments..."
                />
                {reportSuccess ? (
                  <div className="text-emerald-700 font-medium">✓ Report submitted successfully!</div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleReport}
                      disabled={loading}
                      className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-semibold transition-all"
                    >
                      Submit Report
                    </button>
                    <button
                      onClick={() => setShowReport(false)}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Premium Feature Teaser */}
        {result && (
          <div className="mt-8 bg-gradient-to-r from-secondary to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Need More?</h3>
                <p className="text-indigo-100 mb-4">
                  Upgrade to FakeCarrier Pro for advanced features
                </p>
                <ul className="space-y-2 text-sm text-indigo-100">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>PDF reports with detailed analysis</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Batch email scanning (up to 100 at once)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>API access for integrations</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Scan history and analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Team collaboration features</span>
                  </li>
                </ul>
              </div>
              <div className="ml-8 hidden sm:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-1">$29</div>
                  <div className="text-sm text-indigo-200">per month</div>
                  <button className="mt-4 bg-white text-secondary px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-all">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-400">
            <p>© 2025 FakeCarrier. Email security verification powered by AI.</p>
            <p className="mt-2">
              <a href="/admin" className="text-gray-300 hover:text-white transition-colors">Admin Dashboard</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
