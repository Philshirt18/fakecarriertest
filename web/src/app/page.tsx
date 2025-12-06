'use client'

import { useState, useEffect } from 'react'

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
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  // Check if setup is required and disclaimer on mount
  useEffect(() => {
    // Check if disclaimer was already accepted
    const accepted = localStorage.getItem('disclaimerAccepted')
    if (accepted === 'true') {
      setDisclaimerAccepted(true)
    } else {
      setShowDisclaimer(true)
    }
    
    fetch(`${API_BASE_URL}/`)
      .then(res => res.json())
      .then(data => {
        if (data.setup_required) {
          setSetupRequired(true)
        }
      })
      .catch(() => {})
  }, [])
  
  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true')
    setDisclaimerAccepted(true)
    setShowDisclaimer(false)
  }

  const handleScan = async () => {
    if (!sender) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender, 
          headers: headers || '', 
          body: body || '' 
        })
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
          label: 'MEDIUM RISK',
          color: 'bg-amber-50 text-amber-900 border-amber-200',
          badgeColor: 'bg-yellow-500 text-white border-yellow-600',
          sectionColor: 'bg-amber-50/50 border-amber-200',
          icon: '⚠️',
          summary: 'This email has some suspicious signs. Double-check before clicking anything.',
          whyScam: 'The sender\'s domain doesn\'t have proper security measures in place, which legitimate companies always have. (See Technical Details)',
          howToVerify: [
            'Call the company using a phone number from their official website (not from this email)',
            'Check if the sender\'s email address exactly matches the company\'s real domain',
            'Look for spelling mistakes or unusual requests'
          ]
        }
      case 'medium':
        return {
          label: 'MEDIUM RISK',
          color: 'bg-orange-50 text-orange-900 border-orange-200',
          badgeColor: 'bg-yellow-500 text-white border-yellow-600',
          sectionColor: 'bg-orange-50/50 border-orange-200',
          icon: '⚠️',
          summary: 'This email has multiple red flags. It\'s likely trying to trick you.',
          whyScam: 'Multiple security checks failed, and the email shows patterns commonly used by scammers to impersonate legitimate companies. (See Technical Details)',
          howToVerify: [
            'Do NOT click any links or download attachments',
            'Contact the company directly using their official phone number or website',
            'Ask your IT department or a tech-savvy colleague to check it'
          ]
        }
      case 'high':
        return {
          label: 'LIKELY FRAUD',
          color: 'bg-red-50 text-red-900 border-red-200',
          badgeColor: 'bg-red-600 text-white border-red-700',
          sectionColor: 'bg-red-50/50 border-red-200',
          icon: '🚨',
          summary: 'This is almost certainly a scam. Someone is pretending to be someone else to steal from you.',
          whyScam: 'This email failed all major security checks and shows clear signs of impersonation. The sender is not who they claim to be. (See Technical Details)',
          howToVerify: [
            'DELETE this email immediately',
            'Do NOT click anything or reply',
            'Report it to your IT security team',
            'If it claims to be from a company you use, call them directly using the number on their official website'
          ]
        }
      case 'safe':
        return {
          label: 'SAFE',
          color: 'bg-teal-50 text-teal-900 border-teal-200',
          badgeColor: 'bg-green-500 text-white border-green-600',
          sectionColor: 'bg-teal-50/50 border-teal-200',
          icon: '✓',
          summary: 'This email looks safe and passed our security checks.',
          whyScam: 'This email has proper security configurations and doesn\'t show typical scam patterns. (See Technical Details)',
          howToVerify: [
            'Still verify any requests for passwords or sensitive information',
            'Check that links go to the expected website before clicking',
            'If something feels wrong, trust your instincts and verify through another channel'
          ]
        }
      default:
        return {
          label: 'SAFE',
          color: 'bg-teal-50 text-teal-900 border-teal-200',
          badgeColor: 'bg-green-500 text-white border-green-600',
          sectionColor: 'bg-teal-50/50 border-teal-200',
          icon: '✓',
          summary: 'This email passed our security checks and appears to be legitimate.',
          whyScam: 'This email has proper security configurations and doesn\'t show typical scam patterns. (See Technical Details)',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">Important Disclaimer</h2>
              </div>
              
              <div className="space-y-4 text-[#111827] mb-6">
                <p className="leading-relaxed">
                  Welcome to Fake Carriers! Before we get started, here's what you should know:
                </p>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    We're Here to Help, Not Guarantee
                  </h3>
                  <p className="text-sm leading-relaxed">
                    We analyze emails using AI and technical checks to help you spot potential scams. However, scammers are creative and constantly come up with new tricks. <strong>No security tool is perfect</strong>, so when something feels off, trust your instincts and verify through official channels.
                  </p>
                </div>
                
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚖️</span>
                    Use at Your Own Risk
                  </h3>
                  <p className="text-sm leading-relaxed">
                    While we work hard to help protect you, we can't be held responsible for any issues that might arise. This tool is provided "as is" to assist you, but the final decision is always yours.
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <label className="flex items-start gap-3 cursor-pointer group mb-6">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#4F46E5] border-gray-300 rounded focus:ring-[#4F46E5] cursor-pointer"
                  />
                  <span className="text-sm text-[#111827] leading-relaxed group-hover:text-[#4F46E5] transition-colors">
                    I understand that this tool helps identify potential scams but isn't perfect, and I'll verify suspicious emails as recommended. I also understand the developers aren't liable for any issues.
                  </span>
                </label>
                
                <button
                  onClick={handleAcceptDisclaimer}
                  disabled={!disclaimerAccepted}
                  className="w-full bg-gradient-to-r from-[#4F46E5] to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-indigo-600 hover:to-[#4F46E5] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {disclaimerAccepted ? 'Accept and Continue' : 'Please read and check the box above'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-[#111827] border-b border-gray-800 relative overflow-hidden">
        {/* Subtle tech pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo-white.png"
                alt="Fake Carriers Logo" 
                className="h-32 md:h-40 lg:h-48 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <div className="flex items-center gap-3 absolute right-4 sm:right-6 lg:right-8">
              <a 
                href="/setup" 
                className="text-sm bg-[#14B8A6] text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Settings
              </a>
              <a 
                href="/admin" 
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h3 className="text-xl md:text-2xl font-semibold text-[#111827] mb-4">
            Email Security Verification
          </h3>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            AI-powered phishing detection and email authentication analysis
          </p>
        </div>

        {/* Scan Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          {/* Subtle corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4F46E5]/5 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#14B8A6]/5 to-transparent rounded-tr-full"></div>
          
          <div className="space-y-6 relative">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#4F46E5] rounded-full"></span>
                Sender Email Address
                <span className="text-xs font-normal text-red-600">*Required</span>
              </label>
              <input
                type="email"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="carrier@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll check domain reputation, authentication records, and known scam patterns
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {!showOptionalFields ? (
                <button
                  onClick={() => setShowOptionalFields(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-[#111827] py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2 border-gray-300 hover:border-[#14B8A6] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Email Headers & Body (Optional)
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#111827]">Optional: For Deeper Analysis</span>
                      <span className="text-xs text-gray-500">(Recommended for suspicious emails)</span>
                    </div>
                    <button
                      onClick={() => setShowOptionalFields(false)}
                      className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#14B8A6] rounded-full"></span>
                    Email Headers
                    <span className="text-xs font-normal text-gray-500">Optional</span>
                  </label>
                  <textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent font-mono text-sm transition-all bg-gray-50 hover:bg-white"
                    rows={4}
                    placeholder="From: sender@example.com&#10;Subject: Email subject&#10;Date: ..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enables authentication checks (SPF, DKIM, DMARC)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#14B8A6] rounded-full"></span>
                    Email Body
                    <span className="text-xs font-normal text-gray-500">Optional</span>
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    rows={6}
                    placeholder="Email content..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enables content analysis (urgency tactics, threats, suspicious links)
                  </p>
                </div>
              </div>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4F46E5] to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-indigo-600 hover:to-[#4F46E5] disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Email...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Scan Email
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && riskConfig && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4F46E5] via-[#14B8A6] to-[#4F46E5]"></div>
            {/* One-Sentence Summary */}
            <div className="text-center pb-8 border-b border-gray-200">
              <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl border-2 ${riskConfig.badgeColor} text-lg font-bold mb-5 shadow-lg`}>
                <span className="text-2xl">{riskConfig.icon}</span>
                <span>{riskConfig.label}</span>
                <span className="mx-2">•</span>
                <span>Risk Score: {result.score}/100</span>
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
              {(result.risk_level === 'low' || result.risk_level === 'safe') && (
                <button
                  className="bg-[#14B8A6] hover:bg-teal-600 text-white py-6 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  onClick={() => alert('Remember: Even safe-looking emails can be dangerous. Always verify unusual requests!')}
                >
                  <span className="text-3xl">✓</span>
                  <span>{result.risk_level === 'safe' ? 'LOOKS GOOD' : 'PROCEED WITH CAUTION'}</span>
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
      <footer className="bg-[#111827] mt-20 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-400">Powered by AI</p>
              <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">© 2025 Fake Carriers. Email Security Verification</p>
            <p className="mt-2">
              <a href="/admin" className="text-gray-400 hover:text-[#14B8A6] transition-colors text-sm">Admin Dashboard</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
