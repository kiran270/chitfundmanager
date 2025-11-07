'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MemberDashboard() {
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      window.location.href = '/auth/login'
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchMemberGroups(token, parsedUser.userId)
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [])

  const fetchMemberGroups = async (token, userId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/members/${userId}/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const groupsData = await response.json()
        setGroups(groupsData)
      } else {
        console.error('Failed to fetch member groups')
        setError('Failed to load your groups')
      }
    } catch (error) {
      console.error('Error fetching member groups:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Chit Fund Manager</h1>
                <p className="text-xs text-white/80">Member Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                👋 Welcome, {user?.name}!
              </h2>
              <p className="text-white/70 text-sm">
                Track your chit fund investments
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="text-sm font-bold text-white mb-1">My Groups</h3>
              <p className="text-2xl font-bold text-blue-300">{groups.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="text-sm font-bold text-white mb-1">Investment</h3>
              <p className="text-lg font-bold text-green-300">
                ₹{groups.reduce((sum, group) => sum + (group.installmentAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="text-sm font-bold text-white mb-1">Won</h3>
              <p className="text-2xl font-bold text-purple-300">
                {groups.filter(group => group.hasWonAuction).length}
              </p>
            </div>
          </div>
        </div>

        {/* My Groups */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">My Chit Fund Groups</h3>
          
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-bold text-white mb-2">No Groups Yet</h4>
              <p className="text-white/70 text-sm mb-4">
                Contact your administrator to join groups.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {groups.map((group) => (
                <Link key={group.groupId} href={`/member/groups/${group.groupId}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white truncate">{group.groupName}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        group.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                        group.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60 text-xs">Chit Value</span>
                        <span className="text-white font-semibold text-sm">₹{group.chitValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-xs">Monthly EMI</span>
                        <span className="text-white font-semibold text-sm">₹{group.installmentAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-xs">Ticket #</span>
                        <span className="text-blue-300 font-bold text-sm">#{group.ticketNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-xs">Duration</span>
                        <span className="text-white font-semibold text-sm">{group.durationMonths}M</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{group.completedAuctions || 0}/{group.durationMonths}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${((group.completedAuctions || 0) / group.durationMonths) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {group.hasWonAuction && (
                      <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-300 text-sm">🏆</span>
                          <span className="text-yellow-200 text-xs font-semibold">Won auction!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}