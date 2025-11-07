'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0
  })

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
      if (parsedUser.role !== 'admin') {
        alert('Access denied. Admin privileges required.')
        window.location.href = '/member/dashboard'
        return
      }
      setUser(parsedUser)
      fetchGroups(token)
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [])

  const fetchGroups = async (token) => {
    try {
      // Fetch groups
      const groupsResponse = await fetch('http://localhost:5001/api/chitgroups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Fetch members created by this admin
      const membersResponse = await fetch('http://localhost:5001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setGroups(groupsData)

        let totalMembers = 0
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          totalMembers = membersData.length
        }

        // Calculate stats
        const activeGroups = groupsData.filter(g => g.status === 'Active').length
        setStats({
          totalGroups: groupsData.length,
          activeGroups: activeGroups,
          totalMembers: totalMembers
        })
      } else {
        console.error('Failed to fetch groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const handleConductAuction = () => {
    if (groups.length > 0) {
      const activeGroup = groups.find(g => g.status === 'Active')
      if (activeGroup) {
        window.location.href = `/admin/groups/${activeGroup.groupId}/auctions`
      } else {
        alert('Please activate a group first to conduct auctions.')
      }
    } else {
      alert('Please create a group first.')
    }
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
                <p className="text-xs text-white/80">Admin Dashboard</p>
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

      {/* Compact Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Compact Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs">Total Groups</p>
                <p className="text-2xl font-bold text-white">{stats.totalGroups}</p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs">Active Groups</p>
                <p className="text-2xl font-bold text-green-300">{stats.activeGroups}</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs">Total Members</p>
                <p className="text-2xl font-bold text-purple-300">{stats.totalMembers}</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </div>
        </div>

        {/* Compact Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/groups/create">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                <div className="text-xl mb-2">➕</div>
                <h4 className="text-white font-semibold text-sm">Create Group</h4>
                <p className="text-white/80 text-xs">New chit fund</p>
              </div>
            </Link>

            <div
              onClick={handleConductAuction}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="text-xl mb-2">🔨</div>
              <h4 className="text-white font-semibold text-sm">Auctions</h4>
              <p className="text-white/80 text-xs">Run auctions</p>
            </div>

            <Link href="/admin/members">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
                <div className="text-xl mb-2">👥</div>
                <h4 className="text-white font-semibold text-sm">Members</h4>
                <p className="text-white/80 text-xs">Manage users</p>
              </div>
            </Link>

            <div
              onClick={() => {
                if (groups.length > 0) {
                  window.location.href = `/admin/groups/${groups[0].groupId}/reports`
                } else {
                  alert('Please create a group first to view reports.')
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="text-xl mb-2">📊</div>
              <h4 className="text-white font-semibold text-sm">Reports</h4>
              <p className="text-white/80 text-xs">Analytics</p>
            </div>
          </div>
        </div>

        {/* Compact Groups List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Your Chit Groups</h3>
            <Link href="/admin/groups/create">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                + New Group
              </button>
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-bold text-white mb-2">No Groups Yet</h4>
              <p className="text-white/80 mb-4 text-sm">
                Create your first chit fund group to get started.
              </p>
              <Link href="/admin/groups/create">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform text-sm">
                  Create First Group
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.groupId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{group.groupName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-white/60">Chit Value</p>
                          <p className="text-white font-semibold">₹{group.chitValue?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Members</p>
                          <p className="text-white font-semibold">{group.memberCount}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Duration</p>
                          <p className="text-white font-semibold">{group.durationMonths} months</p>
                        </div>
                        <div>
                          <p className="text-white/60">Status</p>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${group.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                            group.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                            {group.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/admin/groups/${group.groupId}`}>
                        <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs transition-colors">
                          Manage
                        </button>
                      </Link>
                      <Link href={`/admin/groups/${group.groupId}/auctions`}>
                        <button className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-2 py-1 rounded text-xs transition-colors">
                          Auctions
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}