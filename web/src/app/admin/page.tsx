'use client'

import { useState, useEffect } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface Scan {
  id: string
  sender: string
  from_domain: string
  score: number
  risk_level: string
  created_at: string
}

interface Report {
  id: string
  sender: string
  from_domain: string
  user_comment: string | null
  created_at: string
}

interface Stats {
  total_scans: number
  total_reports: number
  risk_distribution: Record<string, number>
  top_domains: Array<{ domain: string; count: number; avg_score: number }>
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'scans' | 'reports' | 'stats'>('scans')
  const [scans, setScans] = useState<Scan[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Filters
  const [riskFilter, setRiskFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('')

  const handleLogin = async () => {
    if (!token) {
      setError('Please enter a password')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/password/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: token })
      })
      
      if (response.ok) {
        setAuthenticated(true)
      } else {
        const data = await response.json()
        setError(data.detail || 'Invalid password')
      }
    } catch (err) {
      setError('Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  const fetchScans = async () => {
    setLoading(true)
    setError('')
    try {
      let url = `${API_BASE_URL}/admin/scans?limit=100`
      if (riskFilter) url += `&risk_level=${riskFilter}`
      if (domainFilter) url += `&domain=${domainFilter}`
      
      const response = await fetch(url)
      
      if (!response.ok) throw new Error('Failed to fetch scans')
      const data = await response.json()
      setScans(data)
    } catch (err) {
      setError('Failed to load scans. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports?limit=100`)
      
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError('Failed to load reports. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`)
      
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load stats. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'scans' | 'reports') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/export.csv?type=${type}`)
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}.csv`
      a.click()
    } catch (err) {
      setError('Failed to export data')
    }
  }

  useEffect(() => {
    if (authenticated) {
      if (activeTab === 'scans') fetchScans()
      else if (activeTab === 'reports') fetchReports()
      else if (activeTab === 'stats') fetchStats()
    }
  }, [authenticated, activeTab, riskFilter, domainFilter])

  const getRiskBadge = (level: string) => {
    const configs = {
      low: 'bg-amber-100 text-amber-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    }
    return configs[level as keyof typeof configs] || 'bg-gray-100 text-gray-800'
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo-grey.png"
              alt="Fake Carriers Logo" 
              className="h-24 w-auto mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-primary mb-2">Admin Access</h1>
            <p className="text-gray-700">Enter your password to continue</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            placeholder="Password"
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-secondary text-white py-3 px-6 rounded-lg hover:bg-indigo-600 font-semibold transition-all disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-secondary hover:underline">
              ← Back to Scanner
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo-grey.png"
                alt="Fake Carriers Logo" 
                className="h-32 md:h-40 w-auto object-contain"
              />
            </div>
            <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors font-medium absolute right-4 sm:right-6 lg:right-8">
              ← Back to Scanner
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('scans')}
                className={`px-8 py-4 font-semibold transition-all ${
                  activeTab === 'scans'
                    ? 'border-b-2 border-secondary text-secondary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Scans
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-8 py-4 font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'border-b-2 border-secondary text-secondary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-8 py-4 font-semibold transition-all ${
                  activeTab === 'stats'
                    ? 'border-b-2 border-secondary text-secondary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Scans Tab */}
            {activeTab === 'scans' && (
              <div>
                <div className="flex flex-wrap gap-4 mb-6">
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">All Risk Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  
                  <input
                    type="text"
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    placeholder="Filter by domain"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  
                  <button
                    onClick={() => handleExport('scans')}
                    className="ml-auto bg-accent text-white px-6 py-2 rounded-lg hover:bg-teal-600 font-semibold transition-all"
                  >
                    Export CSV
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-600">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Sender</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Domain</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Score</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Risk</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {scans.map((scan) => (
                          <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900">{scan.sender}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{scan.from_domain}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">{scan.score}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadge(scan.risk_level)}`}>
                                {scan.risk_level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(scan.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => handleExport('reports')}
                    className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-teal-600 font-semibold transition-all"
                  >
                    Export CSV
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-600">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Sender</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Domain</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Comment</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900">{report.sender}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{report.from_domain}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{report.user_comment || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(report.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-secondary to-indigo-600 rounded-xl p-6 text-white">
                    <div className="text-sm font-medium opacity-90 mb-2">Total Scans</div>
                    <div className="text-4xl font-bold">{stats.total_scans.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
                    <div className="text-sm font-medium opacity-90 mb-2">Total Reports</div>
                    <div className="text-4xl font-bold">{stats.total_reports.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-accent to-teal-600 rounded-xl p-6 text-white">
                    <div className="text-sm font-medium opacity-90 mb-2">Risk Distribution</div>
                    <div className="space-y-1 mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Low:</span>
                        <span className="font-semibold">{stats.risk_distribution.low || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium:</span>
                        <span className="font-semibold">{stats.risk_distribution.medium || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>High:</span>
                        <span className="font-semibold">{stats.risk_distribution.high || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Domains */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">Top Domains</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Domain</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Scan Count</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.top_domains.map((domain, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{domain.domain}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{domain.count}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{domain.avg_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
