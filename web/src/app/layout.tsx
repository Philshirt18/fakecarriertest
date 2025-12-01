import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FakeCarrier - Email Security Verification',
  description: 'Verify email authenticity and detect phishing attempts with AI-powered analysis',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
