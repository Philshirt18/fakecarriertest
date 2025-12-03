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
          label: 'BE CAREFUL',
          color: 'bg-amber-50 text-amber-900 border-amber-200',
          badgeColor: 'bg-amber-500 text-white border-amber-600',
          sectionColor: 'bg-amber-50/50 border-amber-200',
          trafficLight: '🟡',
          icon: '⚠️',
          summary: 'This email has some suspicious signs. Double-check before clicking anything.',
          whyScam: 'The sender\'s domain doesn\'t have proper security measures in place, which legitimate companies always have.',
          howToVerify: [
            'Call the company using a phone number from their official website (not from this email)',
            'Check if the sender\'s email address exactly matches the company\'s real domain',
            'Look for spelling mistakes or unusual requests'
          ]
        }
      case 'medium':
        return {
          label: 'DANGER',
          color: 'bg-orange-50 text-orange-900 border-orange-200',
          badgeColor: 'bg-orange-600 text-white border-orange-700',
          sectionColor: 'bg-orange-50/50 border-orange-200',
          trafficLight: '🟠',
          icon: '⚠️',
          summary: 'This email has multiple red flags. It\'s likely trying to trick you.',
          whyScam: 'Multiple security checks failed, and the email shows patterns commonly used by scammers to impersonate legitimate companies.',
          howToVerify: [
            'Do NOT click any links or download attachments',
            'Contact the company directly using their official phone number or website',
            'Ask your IT department or a tech-savvy colleague to check it'
          ]
        }
      case 'high':
        return {
          label: 'STOP! SCAM ALERT',
          color: 'bg-red-50 text-red-900 border-red-200',
          badgeColor: 'bg-red-600 text-white border-red-700',
          sectionColor: 'bg-red-50/50 border-red-200',
          trafficLight: '🔴',
          icon: '🚨',
          summary: 'This is almost certainly a scam. Someone is pretending to be someone else to steal from you.',
          whyScam: 'This email failed all major security checks and shows clear signs of impersonation. The sender is not who they claim to be.',
          howToVerify: [
            'DELETE this email immediately',
            'Do NOT click anything or reply',
            'Report it to your IT security team',
            'If it claims to be from a company you use, call them directly using the number on their official website'
          ]
        }
      default:
        return {
          label: 'LOOKS SAFE',
          color: 'bg-teal-50 text-teal-900 border-teal-200',
          badgeColor: 'bg-[#14B8A6] text-white border-teal-600',
          sectionColor: 'bg-teal-50/50 border-teal-200',
          trafficLight: '🟢',
          icon: '✓',
          summary: 'This email passed our security checks and appears to be legitimate.',
          whyScam: 'This email has proper security configurations and doesn\'t show typical scam patterns.',
          howToVerify: [
            'Still verify any requests for passwords or sensitive information',
            'Check that links go to the expected website before clicking',
            'If something feels wrong, trust your instincts and verify through another channel'
          ]
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
            {/* Traffic Light + One-Sentence Summary */}
            <div className="text-center pb-8 border-b border-gray-200">
              <div className="text-7xl mb-5 drop-shadow-lg">{riskConfig.trafficLight}</div>
              <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl border-2 ${riskConfig.badgeColor} text-lg font-bold mb-5 shadow-lg`}>
                <span className="text-2xl">{riskConfig.icon}</span>
                <span>{riskConfig.label}</span>
              </div>
              <p className="text-lg text-[#111827] font-medium max-w-2xl mx-auto leading-relaxed">
                {riskConfig.summary}
              </p>
            </div>

            {/* Why This Might Be a Scam */}
            <div className={`rounded-xl p-6 border-2 ${riskConfig.sectionColor}`}>
              <h3 className="text-lg font-bold text-[#111827] mb-3 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                Why this might be a scam
              </h3>
              <p className="text-[#111827] leading-relaxed">
                {riskConfig.whyScam}
              </p>
            </div>

            {/* How to Verify */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center">
                <span className="text-2xl mr-2">🔍</span>
                How to check if this email is real:
              </h3>
              <ol className="space-y-3">
                {riskConfig.howToVerify.map((step, i) => (
                  <li key={i} className="flex items-start text-[#111827]">
                    <span className="flex-shrink-0 w-7 h-7 bg-[#4F46E5] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.risk_level === 'high' && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white py-6 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  onClick={() => alert('Delete this email from your inbox immediately.')}
                >
                  <span className="text-3xl">🗑️</span>
                  <span>DELETE THIS EMAIL</span>
                </button>
              )}
              {(result.risk_level === 'high' || result.risk_level === 'medium') && (
                <button
                  className="bg-orange-600 hover:bg-orange-700 text-white py-6 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  onClick={() => setShowReport(true)}
                >
                  <span className="text-3xl">⚠️</span>
                  <span>REPORT TO IT</span>
                </button>
              )}
              <button
                onClick={copyResults}
                className="bg-[#4F46E5] hover:bg-indigo-700 text-white py-6 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <span className="text-3xl">{copied ? '✓' : '📋'}</span>
                <span>{copied ? 'COPIED!' : 'COPY RESULTS'}</span>
              </button>
              {result.risk_level === 'low' && (
                <button
                  className="bg-[#14B8A6] hover:bg-teal-600 text-white py-6 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  onClick={() => alert('Remember: Even safe-looking emails can be dangerous. Always verify unusual requests!')}
                >
                  <span className="text-3xl">✓</span>
                  <span>PROCEED WITH CAUTION</span>
                </button>
              )}
            </div>

            {/* Technical Details - Collapsed by Default */}
            <details className="border-2 border-gray-300 rounded-xl bg-gray-50">
              <summary className="px-6 py-4 cursor-pointer font-bold text-[#111827] hover:bg-gray-100 transition-colors rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-xl">🔧</span>
                  <span>Technical Details</span>
                </span>
                <span className="text-gray-400">▼</span>
              </summary>
              <div className="px-6 py-6 border-t-2 border-gray-300">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Findings:</h4>
                  <ul className="space-y-2">
                    {result.summary.map((item, i) => (
                      <li key={i} className="flex items-start text-gray-700 text-sm">
                        <span className="text-red-600 mr-2 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg">
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
                  <div>
                    <span className="font-medium text-gray-700">Risk Score:</span>
                    <span className="ml-2 text-gray-600">{result.score}/100</span>
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
