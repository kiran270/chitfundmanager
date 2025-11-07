'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          💰 CHIT FUND MANAGER
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Welcome to the future of financial management
        </p>
        <div className="space-x-4">
          <Link href="/auth/register">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
              Get Started
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}