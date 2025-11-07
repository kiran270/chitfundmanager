'use client'

import { useState, useEffect } from 'react'
import { chitGroupsAPI } from '@/lib/api'

interface ChitGroup {
  groupId: string
  groupName: string
  chitValue: number
  installmentAmount: number
  memberCount: number
  durationMonths: number
  status: string
  foremanName: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<ChitGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await chitGroupsAPI.browseAll()
      setGroups(response.data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  // Removed self-join functionality - only admins can add members

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Chit Groups</h1>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No groups available for joining at the moment</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <div key={group.groupId} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{group.groupName}</h3>
                  <p className="text-gray-600">Managed by: {group.foremanName}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {group.status}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Chit Value</p>
                  <p className="font-semibold text-lg">₹{group.chitValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Installment</p>
                  <p className="font-semibold text-lg">₹{group.installmentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold text-lg">{group.durationMonths} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="font-semibold text-lg">{group.memberCount} slots</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Only group administrators can add members to chit groups. 
                  Contact the group foreman ({group.foremanName}) to join this group.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}