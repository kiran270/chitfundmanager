'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function MemberGroupPage() {
  const params = useParams()
  const groupId = params.id
  
  const [user, setUser] = useState(null)
  const [group, setGroup] = useState(null)
  const [auctions, setAuctions] = useState([])
  const [members, setMembers] = useState([])
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
      if (parsedUser.role !== 'member') {
        alert('Access denied. Member privileges required.')
        window.location.href = '/admin/dashboard'
        return
      }
      setUser(parsedUser)
      fetchData(token, parsedUser.userId)
    } catch (error) {
      window.location.href = '/auth/login'
      return
    }
  }, [groupId])

  const fetchData = async (token, userId) => {
    try {
      // Fetch group details from member's groups
      const memberGroupsResponse = await fetch(`http://localhost:5001/api/members/${userId}/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (memberGroupsResponse.ok) {
        const memberGroups = await memberGroupsResponse.json()
        const currentGroup = memberGroups.find(g => g.groupId === groupId)
        if (currentGroup) {
          setGroup(currentGroup)
        } else {
          setError('Group not found or you are not a member')
          return
        }
      } else {
        setError('Failed to load group data')
        return
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
      setError('Failed to load group data')
    } finally {
      setLoading(false)
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
            <h3 className="text-xl font-semibold text-white mb-2">Loading Group Details</h3>
            <p className="text-white/80">Fetching your group information...</p>
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
            <Link href="/member/dashboard">
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
              <Link href="/member/dashboard">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <span className="text-2xl">💰</span>
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{group?.groupName}</h1>
                <p className="text-xs text-white/80">Member View</p>
              </div>
            </div>
            <Link href="/member/dashboard">
              <button className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 px-4 py-2 rounded-lg transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Group Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏆</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{group?.groupName}</h2>
              <p className="text-white/80 text-sm">Your chit fund group details</p>
            </div>
            <div className="ml-auto">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                group?.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                group?.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {group?.status}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-1">Your Ticket Number</p>
              <p className="text-2xl font-bold text-blue-300">
                {group?.ticketNumber ? `#${group.ticketNumber}` : 'Loading...'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-1">Chit Value</p>
              <p className="text-2xl font-bold text-green-300">
                {group?.chitValue ? `₹${group.chitValue.toLocaleString()}` : 'Loading...'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-1">Monthly Installment</p>
              <p className="text-2xl font-bold text-purple-300">
                {group?.installmentAmount ? `₹${group.installmentAmount.toLocaleString()}` : 'Loading...'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-1">Duration</p>
              <p className="text-2xl font-bold text-orange-300">
                {group?.durationMonths ? `${group.durationMonths} months` : 'Loading...'}
              </p>
            </div>
          </div>



          {/* Progress Section */}
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg">Group Progress</h3>
              <span className="text-white/60 text-sm">
                {auctions.length || 0} of {group?.durationMonths || 0} auctions completed
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${group?.durationMonths ? ((auctions.length || 0) / group.durationMonths) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/60">
              <span>Started</span>
              <span>{group?.durationMonths ? Math.round(((auctions.length || 0) / group.durationMonths) * 100) : 0}% Complete</span>
              <span>Target</span>
            </div>
          </div>

          {group?.hasWonAuction && (
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h4 className="text-yellow-200 font-bold text-lg">Congratulations!</h4>
                  <p className="text-yellow-100/80">You have won an auction in this group!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auction History */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-4">
          <div className="border-b border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🔨</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Auction History</h3>
                <p className="text-white/80">Track all completed auctions</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {auctions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔨</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">No Auctions Yet</h4>
                <p className="text-white/80">Auctions will appear here once they are conducted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auctions.sort((a, b) => a.auctionMonth - b.auctionMonth).map((auction) => (
                  <div key={auction.auctionId} className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{auction.auctionMonth}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Month {auction.auctionMonth} Auction</h4>
                          <p className="text-white/60 text-sm">
                            {new Date(auction.auctionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">Winner</p>
                        <p className="text-white font-semibold flex items-center space-x-2">
                          {auction.winnerId === user?.userId && <span className="text-yellow-300">🏆</span>}
                          <span>{auction.winnerName}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center bg-white/5 rounded-lg p-3">
                        <p className="text-white/60 text-sm">Winning Bid</p>
                        <p className="text-blue-200 font-bold">₹{auction.winningBidAmount?.toLocaleString()}</p>
                      </div>
                      <div className="text-center bg-white/5 rounded-lg p-3">
                        <p className="text-white/60 text-sm">Dividend</p>
                        <p className="text-green-200 font-bold">₹{auction.dividend?.toLocaleString()}</p>
                      </div>
                      <div className="text-center bg-white/5 rounded-lg p-3">
                        <p className="text-white/60 text-sm">Net Installment</p>
                        <p className="text-purple-200 font-bold">₹{auction.netInstallment?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Group Members */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="border-b border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Group Members</h3>
                <p className="text-white/80">{members.length} members in this group</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((member) => (
                <div key={member.membershipId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold flex items-center space-x-2">
                      {member.userId === user?.userId && <span className="text-blue-300">👤</span>}
                      <span>{member.name}</span>
                    </h4>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                      #{member.ticketNumber}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">
                    Joined: {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}