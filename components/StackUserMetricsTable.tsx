'use client'

import { useState } from 'react'
import { StackUserMetrics } from '@/types/audit-log'
import { ExportButton } from './ExportButton'
import { formatRelativeTime } from '@/lib/utils'
import { Database, Users, Hash, Calendar, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react'

interface StackUserMetricsTableProps {
  stackMetrics: StackUserMetrics[]
}

export function StackUserMetricsTable({ stackMetrics }: StackUserMetricsTableProps) {
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set())

  const toggleStack = (stack: string) => {
    const newExpanded = new Set(expandedStacks)
    if (newExpanded.has(stack)) {
      newExpanded.delete(stack)
    } else {
      newExpanded.add(stack)
    }
    setExpandedStacks(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stacks</p>
              <p className="text-2xl font-bold text-gray-900">{stackMetrics.length}</p>
            </div>
            <Database className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stackMetrics.reduce((sum, s) => sum + s.totalUsers, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active (90d)</p>
              <p className="text-2xl font-bold text-gray-900">
                {stackMetrics.reduce((sum, s) => sum + s.activeUsers90Days, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Items/Author</p>
              <p className="text-2xl font-bold text-gray-900">
                {stackMetrics.length > 0 ? 
                  Math.round((stackMetrics.reduce((sum, s) => sum + s.avgItemsPerAuthor, 0) / stackMetrics.length) * 100) / 100 
                  : 0
                }
              </p>
            </div>
            <Hash className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Stack Metrics Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Stack User Metrics & Activity Ratios
            </h3>
            <ExportButton 
              data={stackMetrics} 
              filename="stack-user-metrics" 
              label="Export Data"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stack
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Ratio (30d)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Ratio (90d)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Items/Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stackMetrics.map((stack, index) => (
                <>
                  <tr key={stack.stack} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {stack.stack}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {stack.totalUsers.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {stack.activeUsers30Days}/{stack.totalUsers}
                        </div>
                        <div className="ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (stack.activeUsers30Days / stack.totalUsers) > 0.7 ? 'bg-green-100 text-green-800' :
                            (stack.activeUsers30Days / stack.totalUsers) > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round((stack.activeUsers30Days / stack.totalUsers) * 100)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {stack.activeUsers90Days}/{stack.totalUsers}
                        </div>
                        <div className="ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (stack.activeUsers90Days / stack.totalUsers) > 0.8 ? 'bg-green-100 text-green-800' :
                            (stack.activeUsers90Days / stack.totalUsers) > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round((stack.activeUsers90Days / stack.totalUsers) * 100)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Hash className="h-4 w-4 mr-1 text-gray-400" />
                        {stack.avgItemsPerAuthor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleStack(stack.stack)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        {expandedStacks.has(stack.stack) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        View Users
                      </button>
                    </td>
                  </tr>
                  
                  {expandedStacks.has(stack.stack) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">User Details for {stack.stack}</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-white">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    User
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total Items
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Last Activity
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {stack.userDetails.slice(0, 10).map((user) => (
                                  <tr key={user.user}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                      {user.user}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                      {user.totalItems.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                      {formatRelativeTime(user.lastActivity)}
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="flex gap-1">
                                        {user.isActive30Days && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active 30d
                                          </span>
                                        )}
                                        {user.isActive90Days && !user.isActive30Days && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Active 90d
                                          </span>
                                        )}
                                        {!user.isActive90Days && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Inactive
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {stack.userDetails.length > 10 && (
                              <div className="mt-2 text-sm text-gray-500">
                                Showing top 10 of {stack.userDetails.length} users
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
