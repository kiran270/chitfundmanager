'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GroupManagePage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id
  
  const [user, setUser] = useState(null)
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)

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
      fetchGroupData(token)
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [groupId])

  const fetchGroupData = async (token) => {
    try {
      // Fetch group details
      const groupResponse = await fetch('http://localhost:5001/api/chitgroups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (groupResponse.ok) {
        const groups = await groupResponse.json()
        const currentGroup = groups.find(g => g.groupId === groupId)
        if (currentGroup) {
          setGroup(currentGroup)
        } else {
          setError('Group not found')
          return
        }
      }

      // Fetch group members
      const membersResponse = await fetch(`http://localhost:5001/api/chitgroups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData)
      }

    } catch (error) {
      console.error('Error fetching group data:', error)
      setError('Failed to load group data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    setAddingMember(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/chitgroups/${groupId}/add-member`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: newMemberEmail })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Member added successfully! Ticket Number: ${result.ticketNumber}`)
        setNewMemberEmail('')
        fetchGroupData(localStorage.getItem('token')) // Refresh data
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Network error. Please try again.')
    } finally {
      setAddingMember(false)
    }
  }

  const handleActivateGroup = async () => {
    if (!confirm('Are you sure you want to activate this group?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/chitgroups/${groupId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Group activated successfully!')
        fetchGroupData(token)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to activate group')
      }
    } catch (error) {
      console.error('Error activating group:', error)
      alert('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Loading Group Data</h3>
            <p className="text-white/80">Fetching group details and members...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Group</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <Link href="/admin/dashboard">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg">
                Back to Dashboard
              </button>
            </Link>
          </div>
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
              <Link href="/admin/dashboard">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <span className="text-2xl">💰</span>
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{group?.groupName}</h1>
                <p className="text-xs text-white/80">Group Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/admin/groups/${groupId}/auctions`}>
                <button className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3 py-2 rounded-lg transition-colors text-xs">
                  Auctions
                </button>
              </Link>
              <Link href={`/admin/groups/${groupId}/reports`}>
                <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-3 py-2 rounded-lg transition-colors text-xs">
                  Reports
                </button>
              </Link>
              <Link href="/admin/dashboard">
                <button className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 px-3 py-2 rounded-lg transition-colors text-xs">
                  Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Group Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{group?.groupName}</h2>
                <p className="text-white/70 text-sm">Group Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                group?.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                group?.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {group?.status}
              </span>
              {group?.status === 'Pending' && members.length >= group?.memberCount && (
                <button
                  onClick={handleActivateGroup}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  ✨ Activate
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-200 mb-1">Chit Value</p>
              <p className="text-lg font-bold text-blue-100">₹{group?.chitValue?.toLocaleString()}</p>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-green-200 mb-1">Monthly EMI</p>
              <p className="text-lg font-bold text-green-100">₹{group?.installmentAmount?.toLocaleString()}</p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-200 mb-1">Duration</p>
              <p className="text-lg font-bold text-purple-100">{group?.durationMonths}M</p>
            </div>
            <div className="bg-orange-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-orange-200 mb-1">Commission</p>
              <p className="text-lg font-bold text-orange-100">{group?.commissionPercent}%</p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Members ({members.length}/{group?.memberCount})
                </h3>
              </div>
            </div>
            {members.length < group?.memberCount && (
              <div className="text-right bg-white/5 rounded-lg p-2 border border-white/10">
                <p className="text-white/60 text-xs">Remaining</p>
                <p className="text-white font-bold text-lg">{group?.memberCount - members.length}</p>
              </div>
            )}
          </div>

          {/* Add Member Form */}
          {members.length < group?.memberCount && (
            <form onSubmit={handleAddMember} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter member email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={addingMember}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {addingMember ? 'Adding...' : '+ Add'}
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          {members.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No members yet</h4>
              <p className="text-white/70 text-sm">Add members using their email addresses</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {members.map((member) => (
                <div key={member.membershipId} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{member.name.charAt(0)}</span>
                      </div>
                      <h4 className="font-semibold text-white text-sm truncate">{member.name}</h4>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                      #{member.ticketNumber}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs truncate">{member.email}</p>
                  <p className="text-white/50 text-xs mt-1">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href={`/admin/groups/${groupId}/auctions`}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-center hover:scale-105 transition-all duration-200 cursor-pointer">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">🔨</span>
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">Auctions</h4>
              <p className="text-white/80 text-xs">Manage auctions</p>
            </div>
          </Link>
          
          <Link href={`/admin/groups/${groupId}/reports`}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-center hover:scale-105 transition-all duration-200 cursor-pointer">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">📊</span>
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">Reports</h4>
              <p className="text-white/80 text-xs">Analytics</p>
            </div>
          </Link>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-center hover:scale-105 transition-all duration-200 cursor-pointer">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm">💰</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">Payments</h4>
            <p className="text-white/80 text-xs">Track EMIs</p>
          </div>
        </div>
      </div>
    </div>
  )
}