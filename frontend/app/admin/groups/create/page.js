'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateGroupPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    groupName: '',
    chitValue: '',
    installmentAmount: '',
    memberCount: '',
    durationMonths: '',
    commissionPercent: '5',
    startDate: ''
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
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-calculate installment amount when chit value or duration changes
    if (name === 'chitValue' || name === 'durationMonths') {
      const chitValue = name === 'chitValue' ? parseFloat(value) : parseFloat(formData.chitValue)
      const duration = name === 'durationMonths' ? parseInt(value) : parseInt(formData.durationMonths)
      
      if (chitValue && duration) {
        const installment = Math.round(chitValue / duration)
        setFormData(prev => ({
          ...prev,
          installmentAmount: installment.toString()
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/chitgroups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          chitValue: parseFloat(formData.chitValue),
          installmentAmount: parseFloat(formData.installmentAmount),
          memberCount: parseInt(formData.memberCount),
          durationMonths: parseInt(formData.durationMonths),
          commissionPercent: parseFloat(formData.commissionPercent)
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess('Chit group created successfully!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
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
                <h1 className="text-xl font-bold text-white">Create New Group</h1>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create New Chit Fund Group</h2>
            <p className="text-white/80 text-sm">Fill in the details to create a new chit fund group</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-400 text-green-200 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Chit Value (₹) *
                </label>
                <input
                  type="number"
                  name="chitValue"
                  value={formData.chitValue}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  step="1000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Number of Members *
                </label>
                <input
                  type="number"
                  name="memberCount"
                  value={formData.memberCount}
                  onChange={handleInputChange}
                  required
                  min="5"
                  max="50"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  name="durationMonths"
                  value={formData.durationMonths}
                  onChange={handleInputChange}
                  required
                  min="6"
                  max="60"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Monthly Installment (₹) *
                </label>
                <input
                  type="number"
                  name="installmentAmount"
                  value={formData.installmentAmount}
                  onChange={handleInputChange}
                  required
                  min="100"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-calculated"
                />
                <p className="text-white/60 text-xs mt-1">Auto-calculated based on chit value and duration</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  name="commissionPercent"
                  value={formData.commissionPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  step="0.5"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Summary */}
            {formData.chitValue && formData.memberCount && formData.durationMonths && (
              <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                <h3 className="font-semibold text-blue-200 mb-3">Group Summary</h3>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-blue-300 text-xs">Total Fund Value</p>
                    <p className="text-white font-semibold">₹{(parseFloat(formData.chitValue) || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs">Monthly Collection</p>
                    <p className="text-white font-semibold">₹{((parseFloat(formData.installmentAmount) || 0) * (parseInt(formData.memberCount) || 0)).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs">Per Member/Month</p>
                    <p className="text-white font-semibold">₹{(parseFloat(formData.installmentAmount) || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? 'Creating Group...' : 'Create Group'}
              </button>
              
              <Link href="/admin/dashboard">
                <button
                  type="button"
                  className="px-8 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}