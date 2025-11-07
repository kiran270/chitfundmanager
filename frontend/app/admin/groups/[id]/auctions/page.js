'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function AuctionsPage() {
  const params = useParams()
  const groupId = params.id
  
  const [user, setUser] = useState(null)
  const [group, setGroup] = useState(null)
  const [auctions, setAuctions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingAuction, setCreatingAuction] = useState(false)
  const [auctionForm, setAuctionForm] = useState({
    auctionMonth: '',
    winningBidAmount: '',
    winnerId: '',
    winnerName: '',
    auctionDetails: ''
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
      fetchData(token)
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [groupId])

  const fetchData = async (token) => {
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

      // Fetch auctions
      const auctionsResponse = await fetch(`http://localhost:5001/api/chitgroups/${groupId}/auctions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (auctionsResponse.ok) {
        const auctionsData = await auctionsResponse.json()
        setAuctions(auctionsData)
      }

      // Fetch members
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
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAuctionForm(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-fill winner name when winner is selected
    if (name === 'winnerId') {
      const selectedMember = members.find(m => m.userId === value)
      if (selectedMember) {
        setAuctionForm(prev => ({
          ...prev,
          winnerName: selectedMember.name
        }))
      }
    }
  }

  const handleCreateAuction = async (e) => {
    e.preventDefault()
    setCreatingAuction(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/chitgroups/${groupId}/auctions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...auctionForm,
          auctionMonth: parseInt(auctionForm.auctionMonth),
          winningBidAmount: parseFloat(auctionForm.winningBidAmount)
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Auction created successfully!\nDividend: ₹${result.dividend}\nNet Installment: ₹${result.netInstallment}`)
        setShowCreateForm(false)
        setAuctionForm({
          auctionMonth: '',
          winningBidAmount: '',
          winnerId: '',
          winnerName: '',
          auctionDetails: ''
        })
        fetchData(token) // Refresh data
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to create auction')
      }
    } catch (error) {
      console.error('Error creating auction:', error)
      alert('Network error. Please try again.')
    } finally {
      setCreatingAuction(false)
    }
  }

  const calculateAuctionDetails = () => {
    if (!auctionForm.winningBidAmount || !group) return null

    const winningBid = parseFloat(auctionForm.winningBidAmount)
    const commission = winningBid * (group.commissionPercent / 100)
    const dividend = (winningBid - commission) / group.memberCount
    const netInstallment = group.installmentAmount - dividend

    return {
      commission: commission.toFixed(2),
      dividend: dividend.toFixed(2),
      netInstallment: netInstallment.toFixed(2)
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
            <h3 className="text-xl font-semibold text-white mb-2">Loading Auction Data</h3>
            <p className="text-white/80">Fetching group details and auction history...</p>
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
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Data</h2>
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

  const auctionDetails = calculateAuctionDetails()

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
                <p className="text-xs text-white/80">Auction Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/admin/groups/${groupId}`}>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-xs">
                  Members
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Group Status Alert */}
        {group?.status !== 'Active' && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-400/30 rounded-xl p-6 mb-8 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-amber-400/20 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                <span className="text-3xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-200 mb-2 text-lg">Group Not Active</h3>
                <p className="text-amber-100/90 text-sm leading-relaxed">This group must be activated before conducting auctions. Please ensure all members are added and activate the group from the members page.</p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white text-2xl">🔨</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Auction Management
                  </h2>
                  <p className="text-white/80 text-lg">Conduct and manage monthly auctions with style</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex space-x-6 mt-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Total Auctions</p>
                  <p className="text-white font-bold text-xl">{auctions.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">Group Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    group?.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                    group?.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {group?.status}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">Progress</p>
                  <p className="text-white font-bold text-xl">{auctions.length}/{group?.durationMonths}</p>
                </div>
              </div>
            </div>
            
            {group?.status === 'Active' && (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 ${
                    showCreateForm 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  }`}
                >
                  {showCreateForm ? '✕ Cancel' : '✨ New Auction'}
                </button>
                
                {!showCreateForm && (
                  <p className="text-white/60 text-sm text-center">
                    Ready to conduct auction #{auctions.length + 1}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>   
     {/* Create Auction Form */}
        {showCreateForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Conduct New Auction</h3>
            </div>
            
            <form onSubmit={handleCreateAuction} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    📅 Auction Month *
                  </label>
                  <input
                    type="number"
                    name="auctionMonth"
                    value={auctionForm.auctionMonth}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max={group?.durationMonths}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                    placeholder="e.g., 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    💰 Winning Bid Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="winningBidAmount"
                    value={auctionForm.winningBidAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max={group?.chitValue}
                    step="100"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                    placeholder="Enter winning bid amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    🏆 Winner *
                  </label>
                  <select
                    name="winnerId"
                    value={auctionForm.winnerId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                  >
                    <option value="" className="bg-gray-800 text-white">Select winner</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId} className="bg-gray-800 text-white">
                        {member.name} (Ticket #{member.ticketNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    👤 Winner Name
                  </label>
                  <input
                    type="text"
                    name="winnerName"
                    value={auctionForm.winnerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder-white/40 backdrop-blur-sm"
                    placeholder="Auto-filled when winner is selected"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  📝 Auction Details
                </label>
                <textarea
                  name="auctionDetails"
                  value={auctionForm.auctionDetails}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm hover:bg-white/15 resize-none"
                  placeholder="Enter any additional details about the auction..."
                />
              </div>

              {/* Beautiful Calculation Preview */}
              {auctionDetails && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-200 text-sm">📊</span>
                    </div>
                    <h4 className="font-bold text-blue-200 text-lg">Live Auction Calculations</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-green-300 text-xl">💸</span>
                      </div>
                      <p className="text-sm text-green-300 mb-2">Commission ({group?.commissionPercent}%)</p>
                      <p className="text-2xl font-bold text-green-200">₹{parseFloat(auctionDetails.commission).toLocaleString()}</p>
                    </div>
                    <div className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-300 text-xl">🎯</span>
                      </div>
                      <p className="text-sm text-blue-300 mb-2">Dividend per Member</p>
                      <p className="text-2xl font-bold text-blue-200">₹{parseFloat(auctionDetails.dividend).toLocaleString()}</p>
                    </div>
                    <div className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-purple-300 text-xl">💰</span>
                      </div>
                      <p className="text-sm text-purple-300 mb-2">Net Installment</p>
                      <p className="text-2xl font-bold text-purple-200">₹{parseFloat(auctionDetails.netInstallment).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={creatingAuction}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 hover:shadow-xl"
                >
                  {creatingAuction ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Auction...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🔨</span>
                      <span>Conduct Auction</span>
                    </div>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-sm hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Auction History */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          {/* Header */}
          <div className="border-b border-white/20 p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">Auction History</h3>
                    <p className="text-white/80">Complete record of all conducted auctions</p>
                  </div>
                </div>
              </div>
              <div className="text-right bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-white/60 mb-1">Total Auctions</p>
                <p className="text-4xl font-bold text-white">{auctions.length}</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(auctions.length / group?.durationMonths) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {auctions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <span className="text-6xl">🔨</span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">No Auctions Yet</h4>
              <p className="text-white/80 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                {group?.status === 'Active' 
                  ? 'Ready to make history? Start by conducting your first monthly auction for this group.'
                  : 'Activate the group first to unlock the power of auctions.'
                }
              </p>
              {group?.status === 'Active' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
                >
                  🚀 Conduct First Auction
                </button>
              )}
            </div>
          ) : (
            <div className="p-4">
              {/* Beautiful Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                  <div className="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-blue-200 text-2xl">💰</span>
                  </div>
                  <p className="text-sm text-blue-200 font-semibold mb-2">Total Bids</p>
                  <p className="text-3xl font-bold text-blue-100">
                    ₹{auctions.reduce((sum, a) => sum + (a.winningBidAmount || 0), 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                  <div className="w-14 h-14 bg-green-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-green-200 text-2xl">💸</span>
                  </div>
                  <p className="text-sm text-green-200 font-semibold mb-2">Commission</p>
                  <p className="text-3xl font-bold text-green-100">
                    ₹{auctions.reduce((sum, a) => sum + (a.foremanCommission || 0), 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                  <div className="w-14 h-14 bg-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-purple-200 text-2xl">🎯</span>
                  </div>
                  <p className="text-sm text-purple-200 font-semibold mb-2">Avg Dividend</p>
                  <p className="text-3xl font-bold text-purple-100">
                    ₹{auctions.length > 0 ? Math.round(auctions.reduce((sum, a) => sum + (a.dividend || 0), 0) / auctions.length).toLocaleString() : '0'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                  <div className="w-14 h-14 bg-orange-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-orange-200 text-2xl">📊</span>
                  </div>
                  <p className="text-sm text-orange-200 font-semibold mb-2">Progress</p>
                  <p className="text-3xl font-bold text-orange-100">
                    {auctions.length}/{group?.durationMonths}
                  </p>
                </div>
              </div> 
             {/* Beautiful Auction Table */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                              <span className="text-indigo-200 text-sm">📅</span>
                            </div>
                            <span className="text-white font-semibold">Month</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                              <span className="text-purple-200 text-sm">🏆</span>
                            </div>
                            <span className="text-white font-semibold">Winner</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-white font-semibold">Winning Bid</span>
                            <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                              <span className="text-blue-200 text-sm">💰</span>
                            </div>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-white font-semibold">Commission</span>
                            <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                              <span className="text-green-200 text-sm">💸</span>
                            </div>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-white font-semibold">Dividend</span>
                            <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                              <span className="text-purple-200 text-sm">🎯</span>
                            </div>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="text-white font-semibold">Net Installment</span>
                            <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                              <span className="text-orange-200 text-sm">📊</span>
                            </div>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <span className="text-white font-semibold">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    
                    {/* Table Body */}
                    <tbody className="divide-y divide-white/5">
                      {auctions.sort((a, b) => a.auctionMonth - b.auctionMonth).map((auction, index) => (
                        <tr key={auction.auctionId} className="hover:bg-white/5 transition-all duration-200 group">
                          {/* Month Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                                <span className="text-white font-bold text-lg">{auction.auctionMonth}</span>
                              </div>
                              <div>
                                <p className="text-white font-semibold">Month {auction.auctionMonth}</p>
                                <p className="text-white/60 text-sm">
                                  {new Date(auction.auctionDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Winner Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">🏆</span>
                              </div>
                              <div>
                                <p className="text-white font-semibold">{auction.winnerName}</p>
                                <p className="text-white/60 text-sm">Winner</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Winning Bid Column */}
                          <td className="px-6 py-4 text-right">
                            <div className="space-y-1">
                              <p className="text-blue-200 font-bold text-lg">₹{auction.winningBidAmount?.toLocaleString()}</p>
                              <p className="text-white/40 text-xs">
                                {((auction.winningBidAmount / group?.chitValue) * 100).toFixed(1)}% of chit
                              </p>
                            </div>
                          </td>
                          
                          {/* Commission Column */}
                          <td className="px-6 py-4 text-right">
                            <div className="space-y-1">
                              <p className="text-green-200 font-bold text-lg">₹{auction.foremanCommission?.toLocaleString()}</p>
                              <p className="text-white/40 text-xs">{group?.commissionPercent}% rate</p>
                            </div>
                          </td>
                          
                          {/* Dividend Column */}
                          <td className="px-6 py-4 text-right">
                            <div className="space-y-1">
                              <p className="text-purple-200 font-bold text-lg">₹{auction.dividend?.toLocaleString()}</p>
                              <p className="text-white/40 text-xs">per member</p>
                            </div>
                          </td>
                          
                          {/* Net Installment Column */}
                          <td className="px-6 py-4 text-right">
                            <div className="space-y-1">
                              <p className="text-orange-200 font-bold text-lg">₹{auction.netInstallment?.toLocaleString()}</p>
                              <p className="text-white/40 text-xs">after dividend</p>
                            </div>
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg flex items-center justify-center transition-colors group-hover:scale-110 duration-200">
                                <span className="text-blue-300 text-sm">👁️</span>
                              </button>
                              <button className="w-8 h-8 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg flex items-center justify-center transition-colors group-hover:scale-110 duration-200">
                                <span className="text-purple-300 text-sm">📄</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Auction Details Expandable Rows */}
                {auctions.filter(auction => auction.auctionDetails).length > 0 && (
                  <div className="border-t border-white/10 bg-white/5">
                    <div className="p-6">
                      <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                        <span className="text-lg">📝</span>
                        <span>Auction Details</span>
                      </h4>
                      <div className="space-y-3">
                        {auctions.filter(auction => auction.auctionDetails).map((auction) => (
                          <div key={`details-${auction.auctionId}`} className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-indigo-300 font-bold text-sm">{auction.auctionMonth}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-white/90 text-sm leading-relaxed">
                                  <span className="font-semibold text-indigo-300">Month {auction.auctionMonth}: </span>
                                  {auction.auctionDetails}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Beautiful Progress Section */}
              <div className="mt-8 p-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-300 text-lg">🎯</span>
                    </div>
                    <h4 className="font-bold text-white text-xl">Group Progress</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-white/60">
                      {auctions.length} of {group?.durationMonths} months completed
                    </span>
                    <p className="text-2xl font-bold text-white">
                      {Math.round((auctions.length / group?.durationMonths) * 100)}%
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${(auctions.length / group?.durationMonths) * 100}%` }}
                    >
                      <div className="h-full bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Progress markers */}
                  <div className="flex justify-between text-xs text-white/60 mt-3">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Started</span>
                    </span>
                    <span className="font-semibold text-white">
                      {Math.round((auctions.length / group?.durationMonths) * 100)}% Complete
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Target</span>
                    </span>
                  </div>
                </div>
                
                {/* Completion message */}
                {auctions.length === group?.durationMonths && (
                  <div className="mt-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-green-200 font-semibold">Congratulations! All auctions completed!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}