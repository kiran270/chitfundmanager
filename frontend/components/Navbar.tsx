'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  userId: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const getHomeLink = () => {
    if (!user) return '/'
    return user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'
  }

  const getNavItems = () => {
    if (!user) return []

    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Groups', href: '/admin/dashboard' },
        { label: 'Create Group', href: '/admin/groups/create' },
      ]
    } else {
      return [
        { label: 'Dashboard', href: '/member/dashboard' },
        { label: 'Browse Groups', href: '/groups' },
      ]
    }
  }

  // Don't show navbar on auth pages
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    if (currentPath.includes('/auth/')) {
      return null
    }
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href={getHomeLink()} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">CF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Chit Fund Manager
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              {getNavItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user.name.charAt(0)}</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={getHomeLink()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Home"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            {user ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                {getNavItems().map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Action Buttons */}
                <div className="flex space-x-2 px-4 pt-4 border-t border-gray-200/50">
                  <Link
                    href={getHomeLink()}
                    className="flex-1 btn-secondary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏠 Home
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link
                  href="/auth/login"
                  className="block btn-secondary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}