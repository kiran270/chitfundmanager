'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MembersManagePage() {
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  })
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
      fetchData(token)
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [])

  const fetchData = async (token) => {
    try {
      // Fetch all users (members)
      const usersResponse = await fetch('http://localhost:5001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setMembers(usersData)
      }

      // Fetch groups for member assignment
      const groupsResponse = await fetch('http://localhost:5001/api/chitgroups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setGroups(groupsData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setNewMember({
      ...newMember,
      [e.target.name]: e.target.value
    })
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setAddingMember(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/admin/members', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newMember,
          password: 'member123' // Default password
        })
      })

      if (response.ok) {
        alert('Member added successfully! Default password: member123')
        setShowAddForm(false)
        setNewMember({
          name: '',
          email: '',
          phoneNumber: '',
          address: ''
        })
        fetchData(token) // Refresh data
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Loading Members</h3>
            <p className="text-white/80">Fetching member data...</p>
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
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Members</h2>
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
                <h1 className="text-xl font-bold text-white">Members Management</h1>
                <p className="text-xs text-white/80">Admin Dashboard</p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <button className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 px-4 py-2 rounded-lg transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Page Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Members Management</h2>
              <p className="text-white/70 text-sm">Manage all members - {members.length} total</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                showAddForm 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {showAddForm ? '✕ Cancel' : '+ Add Member'}
            </button>
          </div>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
            <h3 className="text-lg font-bold text-white mb-4">Add New Member</h3>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newMember.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newMember.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={newMember.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newMember.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3">
                <p className="text-blue-200 text-sm">
                  <strong>Note:</strong> New members will be created with default password "member123". 
                  They can change it after first login.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={addingMember}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {addingMember ? 'Adding Member...' : '+ Add Member'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-8 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <h3 className="text-lg font-bold text-white mb-4">All Members ({members.length})</h3>

          {members.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="text-lg font-bold text-white mb-2">No Members Yet</h4>
              <p className="text-white/80 mb-4 text-sm">Add your first member to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform text-sm"
              >
                + Add First Member
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((member) => (
                <div key={member.userId} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{member.name}</h4>
                      <p className="text-white/60 text-xs">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-white/80 text-xs truncate">{member.email}</p>
                    {member.phoneNumber && (
                      <p className="text-white/80 text-xs">{member.phoneNumber}</p>
                    )}
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