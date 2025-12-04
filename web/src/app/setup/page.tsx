'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export default function SetupPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'password' | 'outlook'>('password')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordSet, setPasswordSet] = useState(false)

  useEffect(() => {
    checkPasswordStatus()
  }, [])

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`)
      const data = await response.json()
      
      if (data.password_set) {
        setPasswordSet(true)
        setActiveTab('outlook')
      }
    } catch (err) {
      console.error('Failed to check password status')
    }
  }

  const handleSetPassword = async () => {
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/admin/password/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        setSuccess(true)
        setPasswordSet(true)
        setTimeout(() => {
          setSuccess(false)
          setActiveTab('outlook')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to set password')
      }
    } catch (err) {
      setError('Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }

  const downloadManifest = async () => {
    try {
      const manifestUrl = `${window.location.origin}/outlook-addin/manifest.xml`
      const response = await fetch(manifestUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fakecarrier-manifest.xml'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download manifest file')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo-grey.png"
            alt="Fake Carriers Logo" 
            className="h-32 md:h-40 w-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-gray-700">Configure your FakeCarrier installation</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-8 py-4 font-semibold transition-all ${
                  activeTab === 'password'
                    ? 'border-b-2 border-secondary text-secondary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Admin Password
              </button>
              <button
                onClick={() => setActiveTab('outlook')}
                className={`flex-1 px-8 py-4 font-semibold transition-all ${
                  activeTab === 'outlook'
                    ? 'border-b-2 border-secondary text-secondary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Outlook Integration
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-bold text-primary mb-4">
                  {passwordSet ? 'Update Admin Password' : 'Set Admin Password'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {passwordSet 
                    ? 'Change your admin password to access the dashboard'
                    : 'Create a password to access the admin dashboard'}
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
                    ✓ Password {passwordSet ? 'updated' : 'set'} successfully!
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter a secure password"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Gemini API Key (Optional)
                    </label>
                    <input
                      type="text"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="AIza... (optional, for AI-powered analysis)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get a free API key from{' '}
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSetPassword}
                  disabled={loading || success}
                  className="w-full bg-secondary text-white py-3 px-6 rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 font-semibold transition-all"
                >
                  {loading ? 'Saving...' : passwordSet ? 'Update Password' : 'Set Password'}
                </button>
              </div>
            )}

            {/* Outlook Tab */}
            {activeTab === 'outlook' && (
              <div>
                <h2 className="text-xl font-bold text-primary mb-4">
                  Connect Outlook Add-in
                </h2>
                <p className="text-gray-600 mb-6">
                  Install the FakeCarrier add-in to scan emails directly from Outlook
                </p>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold mr-4">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-2">Download Manifest File</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          Download the manifest.xml file to install the add-in
                        </p>
                        <button
                          onClick={downloadManifest}
                          className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-indigo-600 font-semibold transition-all text-sm"
                        >
                          Download manifest.xml
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold mr-4">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-2">Install in Outlook</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>For Microsoft 365 Business/Enterprise:</strong>
                        </p>
                        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside mb-4">
                          <li>Go to <strong>Microsoft 365 Admin Center</strong> (admin.microsoft.com)</li>
                          <li>Navigate to <strong>Settings</strong> → <strong>Integrated apps</strong></li>
                          <li>Click <strong>Upload custom apps</strong></li>
                          <li>Upload the manifest.xml file</li>
                          <li>Deploy to your organization</li>
                        </ol>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>For Personal Accounts:</strong>
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          Microsoft has restricted custom add-in installation for personal accounts. 
                          Use the web app directly to scan emails by copying content from Outlook.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold mr-4">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-2">Start Scanning</h3>
                        <p className="text-sm text-gray-700">
                          Open any email in Outlook and click the FakeCarrier icon to scan for phishing attempts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>⚠️ Important:</strong> Custom Outlook add-ins require Microsoft 365 Business/Enterprise with admin access. 
                      Personal Microsoft accounts cannot install custom add-ins.
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Alternative:</strong> Users can copy email content from Outlook and paste it into the FakeCarrier web app for scanning.
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>🚀 Production:</strong> When deploying, update manifest.xml with your domain and publish through Microsoft AppSource for public availability.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <a href="/" className="text-secondary hover:underline font-medium">
            ← Back to Scanner
          </a>
        </div>
      </div>
    </div>
  )
}
