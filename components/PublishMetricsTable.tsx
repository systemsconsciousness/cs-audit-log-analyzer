'use client'

import { useState } from 'react'
import { PublishMetrics } from '@/types/audit-log'
import { ExportButton } from './ExportButton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Hash, Users, Calendar, ChevronDown, ChevronRight } from 'lucide-react'

interface PublishMetricsTableProps {
  metrics: PublishMetrics[]
}

export function PublishMetricsTable({ metrics }: PublishMetricsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [timePeriod, setTimePeriod] = useState<'last30Days' | 'last90Days' | 'allTime'>('allTime')

  const toggleRow = (contentType: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(contentType)) {
      newExpanded.delete(contentType)
    } else {
      newExpanded.add(contentType)
    }
    setExpandedRows(newExpanded)
  }

  const chartData = metrics.slice(0, 10).map(metric => ({
    name: metric.contentType,
    publishes: metric.publishesByPeriod[timePeriod],
    entries: metric.totalEntries
  }))

  return (
    <div className="space-y-6">
      {/* Summary Chart */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Publish Activity by Content Type
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="allTime">All Time</option>
              <option value="last90Days">Last 90 Days</option>
              <option value="last30Days">Last 30 Days</option>
            </select>
            <ExportButton 
              data={metrics} 
              filename="publish-metrics" 
              label="Export Data"
            />
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="publishes" fill="#3b82f6" name="Publishes" />
              <Bar dataKey="entries" fill="#10b981" name="Total Entries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Type Publish Metrics
            </h3>
            <ExportButton 
              data={metrics} 
              filename="detailed-publish-metrics" 
              label="Export Table"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Publishes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publish Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Publishers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <>
                  <tr key={metric.contentType} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {metric.contentType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Hash className="h-4 w-4 mr-1 text-gray-400" />
                        {metric.totalPublishes.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.totalEntries.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.publishRatio > 2 ? 'bg-red-100 text-red-800' :
                        metric.publishRatio > 1 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {metric.publishRatio.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>30d: {metric.publishesByPeriod.last30Days}</div>
                        <div>90d: {metric.publishesByPeriod.last90Days}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {metric.topPublishers.slice(0, 3).map((publisher) => (
                          <span
                            key={publisher.user}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {publisher.user} ({publisher.count})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleRow(metric.contentType)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        {expandedRows.has(metric.contentType) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        Details
                      </button>
                    </td>
                  </tr>
                  
                  {expandedRows.has(metric.contentType) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">By Locale</h4>
                            <div className="space-y-1">
                              {Object.entries(metric.byLocale).map(([locale, count]) => (
                                <div key={locale} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{locale}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">By Stack</h4>
                            <div className="space-y-1">
                              {Object.entries(metric.byStack).map(([stack, count]) => (
                                <div key={stack} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{stack}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                              ))}
                            </div>
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
