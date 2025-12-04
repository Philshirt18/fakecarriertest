'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface TimelineData {
  timeline: Record<string, { safe: number; low: number; medium: number; high: number }>
}

interface HighRiskScan {
  id: string
  sender: string
  from_domain: string
  score: number
  risk_level: string
  summary: string[]
  created_at: string
}

interface TrendingDomain {
  domain: string
  scan_count: number
  avg_score: number
  last_scan: string
}

export default function AnalyticsPage() {
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [highRiskScans, setHighRiskScans] = useState<HighRiskScan[]>([])
  const [trendingDomains, setTrendingDomains] = useState<TrendingDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetchData()
  }, [days])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [timelineRes, highRiskRes, trendingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/timeline?days=${days}`),
        fetch(`${API_BASE_URL}/admin/high-risk?days=${days}`),
        fetch(`${API_BASE_URL}/admin/trending-domains?days=${days}`)
      ])

      if (timelineRes.ok) setTimeline(await timelineRes.json())
      if (highRiskRes.ok) setHighRiskScans(await highRiskRes.json())
      if (trendingRes.ok) setTrendingDomains(await trendingRes.json())
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-teal-600 bg-teal-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-red-600'
    if (score >= 35) return 'text-orange-600'
    if (score >= 15) return 'text-yellow-600'
    return 'text-teal-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-[#111827] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Advanced threat intelligence and trends</p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/admin" 
                className="text-sm bg-[#4F46E5] text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
              >
                ← Back to Admin
              </Link>
              <Link 
                href="/" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Time Range:</span>
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                days === d
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[#111827] mb-4">Scan Activity Timeline</h2>
              {timeline && Object.keys(timeline.timeline).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(timeline.timeline).map(([date, counts]) => {
                    const total = counts.safe + counts.low + counts.medium + counts.high
                    return (
                      <div key={date} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-24">{date}</span>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                          {counts.safe > 0 && (
                            <div 
                              className="bg-teal-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(counts.safe / total) * 100}%` }}
                              title={`Safe: ${counts.safe}`}
                            >
                              {counts.safe > 0 && counts.safe}
                            </div>
                          )}
                          {counts.low > 0 && (
                            <div 
                              className="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(counts.low / total) * 100}%` }}
                              title={`Low: ${counts.low}`}
                            >
                              {counts.low > 0 && counts.low}
                            </div>
                          )}
                          {counts.medium > 0 && (
                            <div 
                              className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(counts.medium / total) * 100}%` }}
                              title={`Medium: ${counts.medium}`}
                            >
                              {counts.medium > 0 && counts.medium}
                            </div>
                          )}
                          {counts.high > 0 && (
                            <div 
                              className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${(counts.high / total) * 100}%` }}
                              title={`High: ${counts.high}`}
                            >
                              {counts.high > 0 && counts.high}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 font-medium w-12 text-right">{total}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No scan data available for this period</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500 rounded"></div>
                  <span className="text-gray-600">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">High Risk</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* High Risk Scans */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#111827] mb-4">Recent High-Risk Scans</h2>
                {highRiskScans.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {highRiskScans.map(scan => (
                      <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{scan.sender}</p>
                            <p className="text-xs text-gray-500">{scan.from_domain}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(scan.risk_level)}`}>
                            {scan.risk_level.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-2xl font-bold ${getScoreColor(scan.score)}`}>
                            {scan.score}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(scan.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {scan.summary && scan.summary.length > 0 && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{scan.summary[0]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No high-risk scans in this period</p>
                )}
              </div>

              {/* Trending Domains */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#111827] mb-4">Trending Domains</h2>
                {trendingDomains.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {trendingDomains.map((domain, idx) => (
                      <div key={domain.domain} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-[#4F46E5]">#{idx + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{domain.domain}</p>
                              <p className="text-xs text-gray-500">{domain.scan_count} scans</p>
                            </div>
                          </div>
                          <span className={`text-xl font-bold ${getScoreColor(domain.avg_score)}`}>
                            {domain.avg_score}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Last scan: {new Date(domain.last_scan).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No trending domains in this period</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
