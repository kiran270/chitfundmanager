'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function GroupReportsPage() {
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

    // Calculate analytics
    const analytics = {
        totalBids: auctions.reduce((sum, a) => sum + (a.winningBidAmount || 0), 0),
        totalCommission: auctions.reduce((sum, a) => sum + (a.foremanCommission || 0), 0),
        totalDividends: auctions.reduce((sum, a) => sum + (a.dividend || 0), 0),
        avgBidAmount: auctions.length > 0 ? auctions.reduce((sum, a) => sum + (a.winningBidAmount || 0), 0) / auctions.length : 0,
        avgDividend: auctions.length > 0 ? auctions.reduce((sum, a) => sum + (a.dividend || 0), 0) / auctions.length : 0,
        completionRate: group?.durationMonths ? (auctions.length / group.durationMonths) * 100 : 0,
        remainingMonths: group?.durationMonths ? group.durationMonths - auctions.length : 0,
        projectedTotal: group?.chitValue ? group.chitValue * group.memberCount : 0
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-2">Loading Reports</h3>
                        <p className="text-white/80">Generating analytics and insights...</p>
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
                        <h2 className="text-2xl font-bold text-white mb-3">Error Loading Reports</h2>
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
                                <p className="text-xs text-white/80">Reports & Analytics</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Link href={`/admin/groups/${groupId}`}>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-xs">
                                    Members
                                </button>
                            </Link>
                            <Link href={`/admin/groups/${groupId}/auctions`}>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-xs">
                                    Auctions
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
                {/* Page Header */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 mb-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-white text-2xl">📊</span>
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Group Reports & Analytics
                            </h2>
                            <p className="text-white/80 text-lg">Comprehensive insights and performance metrics</p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                        <div className="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-blue-200 text-2xl">💰</span>
                        </div>
                        <p className="text-sm text-blue-200 font-semibold mb-2">Total Bids Collected</p>
                        <p className="text-3xl font-bold text-blue-100">₹{analytics.totalBids.toLocaleString()}</p>
                        <p className="text-xs text-blue-300 mt-1">{auctions.length} auctions completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                        <div className="w-14 h-14 bg-green-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-green-200 text-2xl">💸</span>
                        </div>
                        <p className="text-sm text-green-200 font-semibold mb-2">Total Commission</p>
                        <p className="text-3xl font-bold text-green-100">₹{analytics.totalCommission.toLocaleString()}</p>
                        <p className="text-xs text-green-300 mt-1">{group?.commissionPercent}% commission rate</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                        <div className="w-14 h-14 bg-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-purple-200 text-2xl">🎯</span>
                        </div>
                        <p className="text-sm text-purple-200 font-semibold mb-2">Avg Dividend</p>
                        <p className="text-3xl font-bold text-purple-100">₹{Math.round(analytics.avgDividend).toLocaleString()}</p>
                        <p className="text-xs text-purple-300 mt-1">per member per auction</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                        <div className="w-14 h-14 bg-orange-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="text-orange-200 text-2xl">📈</span>
                        </div>
                        <p className="text-sm text-orange-200 font-semibold mb-2">Completion Rate</p>
                        <p className="text-3xl font-bold text-orange-100">{analytics.completionRate.toFixed(1)}%</p>
                        <p className="text-xs text-orange-300 mt-1">{analytics.remainingMonths} months remaining</p>
                    </div>
                </div>

                {/* Detailed Analytics */}
                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                    {/* Financial Summary */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">💰</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Financial Summary</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-white/80">Group Chit Value</span>
                                <span className="text-white font-bold text-lg">₹{group?.chitValue?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-white/80">Monthly Installment</span>
                                <span className="text-white font-bold text-lg">₹{group?.installmentAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-white/80">Total Members</span>
                                <span className="text-white font-bold text-lg">{members.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-white/80">Projected Total Collection</span>
                                <span className="text-green-300 font-bold text-lg">₹{analytics.projectedTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/30">
                                <span className="text-blue-200">Average Bid Amount</span>
                                <span className="text-blue-200 font-bold text-lg">₹{Math.round(analytics.avgBidAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Tracking */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">📈</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Progress Tracking</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-white/80">Auction Progress</span>
                                    <span className="text-white font-bold">{auctions.length}/{group?.durationMonths}</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                        style={{ width: `${analytics.completionRate}%` }}
                                    >
                                        <div className="h-full bg-white/20 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-white/60 text-sm mt-2">{analytics.completionRate.toFixed(1)}% Complete</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-white/60 text-sm mb-1">Completed</p>
                                    <p className="text-green-300 font-bold text-2xl">{auctions.length}</p>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-white/60 text-sm mb-1">Remaining</p>
                                    <p className="text-orange-300 font-bold text-2xl">{analytics.remainingMonths}</p>
                                </div>
                            </div>

                            {analytics.completionRate === 100 && (
                                <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg text-center">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <p className="text-green-200 font-semibold">Group Completed Successfully!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {auctions.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">📋</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Recent Auction Activity</h3>
                        </div>

                        <div className="space-y-4">
                            {auctions.slice(-5).reverse().map((auction, index) => (
                                <div key={auction.auctionId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold">{auction.auctionMonth}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">Month {auction.auctionMonth} Auction</p>
                                            <p className="text-white/60 text-sm">Winner: {auction.winnerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-200 font-bold">₹{auction.winningBidAmount?.toLocaleString()}</p>
                                        <p className="text-white/60 text-sm">
                                            {new Date(auction.auctionDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}