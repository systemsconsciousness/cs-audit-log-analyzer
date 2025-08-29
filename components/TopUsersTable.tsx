'use client'

import { UserActivity, UserEngagement, AnalyticsData } from '@/types/audit-log'
import { formatRelativeTime } from '@/lib/utils'
import { ExportButton } from './ExportButton'
import { User, Calendar, Hash, Zap, Database, Globe, FileText } from 'lucide-react'

interface TopUsersTableProps {
  users: UserActivity[]
  userEngagement: UserEngagement[]
  analytics: AnalyticsData
}

export function TopUsersTable({ users, userEngagement, analytics }: TopUsersTableProps) {
  // Create a map for quick lookup of engagement data
  const engagementMap = userEngagement.reduce((acc, user) => {
    acc[user.user] = user
    return acc
  }, {} as { [key: string]: UserEngagement })
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            User Activity Analysis
          </h3>
          <ExportButton 
            data={userEngagement} 
            filename="user-engagement-analysis" 
            label="Export Users"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-blue-600 font-medium">Active in 30 Days</div>
            <div className="text-lg font-bold text-blue-900">
              {analytics.userActivitySummary.activeInLast30Days}/{analytics.userActivitySummary.totalUsers}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-green-600 font-medium">Active in 90 Days</div>
            <div className="text-lg font-bold text-green-900">
              {analytics.userActivitySummary.activeInLast90Days}/{analytics.userActivitySummary.totalUsers}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-purple-600 font-medium">Content Builders</div>
            <div className="text-lg font-bold text-purple-900">
              {userEngagement.filter(u => u.isContentBuilder).length}
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="text-orange-600 font-medium">Multi-Stack Users</div>
            <div className="text-lg font-bold text-orange-900">
              {userEngagement.filter(u => u.stacksUsed.length > 1).length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage Scope
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Events
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.slice(0, 20).map((user, index) => {
              const topEvents = Object.entries(user.eventTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
              
              const engagement = engagementMap[user.user]

              return (
                <tr key={user.user} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.user || 'Unknown User'}
                        </div>
                        {engagement?.isContentBuilder && (
                          <div className="flex items-center text-xs text-green-600">
                            <Zap className="h-3 w-3 mr-1" />
                            Content Builder
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Hash className="h-4 w-4 mr-1 text-gray-400" />
                      {user.totalEvents.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatRelativeTime(user.lastActivity)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {engagement?.activeInLast30Days && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active 30d
                        </span>
                      )}
                      {engagement?.activeInLast90Days && !engagement?.activeInLast30Days && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Active 90d
                        </span>
                      )}
                      {!engagement?.activeInLast90Days && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1 text-xs">
                      {engagement && (
                        <>
                          <div className="flex items-center text-gray-600">
                            <Database className="h-3 w-3 mr-1" />
                            {engagement.stacksUsed.length} stack{engagement.stacksUsed.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FileText className="h-3 w-3 mr-1" />
                            {engagement.contentTypesUsed.length} type{engagement.contentTypesUsed.length !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Globe className="h-3 w-3 mr-1" />
                            {engagement.localesUsed.length} locale{engagement.localesUsed.length !== 1 ? 's' : ''}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {topEvents.map(([event, count]) => (
                        <span
                          key={event}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {event} ({count})
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
