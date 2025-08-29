'use client'

import { useState } from 'react'
import { ContentTypeLocaleAdoption } from '@/types/audit-log'
import { ExportButton } from './ExportButton'
import { formatRelativeTime } from '@/lib/utils'
import { Globe, FileText, Users, Calendar, Hash, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ContentTypeLocaleAdoptionProps {
  adoptionData: ContentTypeLocaleAdoption[]
}

export function ContentTypeLocaleAdoptionTable({ adoptionData }: ContentTypeLocaleAdoptionProps) {
  const [selectedContentType, setSelectedContentType] = useState<string>('all')
  const [selectedLocale, setSelectedLocale] = useState<string>('all')

  // Get unique content types and locales for filters
  const contentTypes = Array.from(new Set(adoptionData.map(d => d.contentType))).sort()
  const locales = Array.from(new Set(adoptionData.map(d => d.locale))).sort()

  // Filter data based on selections
  const filteredData = adoptionData.filter(item => {
    const matchesContentType = selectedContentType === 'all' || item.contentType === selectedContentType
    const matchesLocale = selectedLocale === 'all' || item.locale === selectedLocale
    return matchesContentType && matchesLocale
  })

  // Group by content type for summary view
  const contentTypeSummary = contentTypes.map(ct => {
    const ctData = adoptionData.filter(d => d.contentType === ct)
    return {
      contentType: ct,
      totalLocales: ctData.length,
      totalEntries: ctData.reduce((sum, d) => sum + d.totalEntries, 0),
      totalPublished: ctData.reduce((sum, d) => sum + d.publishedEntries, 0),
      topLocales: ctData
        .sort((a, b) => b.totalEntries - a.totalEntries)
        .slice(0, 3)
        .map(d => ({ locale: d.localeName, count: d.totalEntries }))
    }
  })

  // Chart data
  const contentTypeBreakdown = contentTypes.map(ct => {
    const ctData = adoptionData.filter(d => d.contentType === ct)
    return {
      name: ct,
      totalEntries: ctData.reduce((sum, d) => sum + d.totalEntries, 0),
      locales: ctData.length,
      color: ctData.length > 5 ? '#7c4dff' : ctData.length > 3 ? '#1783ff' : '#ec3cdb'
    }
  }).sort((a, b) => b.totalEntries - a.totalEntries).slice(0, 8)

  const localeBreakdown = locales.map(locale => {
    const localeData = adoptionData.filter(d => d.locale === locale)
    return {
      name: localeData[0]?.localeName || locale,
      totalEntries: localeData.reduce((sum, d) => sum + d.totalEntries, 0),
      contentTypes: localeData.length,
      color: localeData.length > 10 ? '#7c4dff' : localeData.length > 5 ? '#1783ff' : '#ec3cdb'
    }
  }).sort((a, b) => b.totalEntries - a.totalEntries).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locale Activity Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Locale Activity Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="totalEntries" fill="#1783ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Content Types by Total Entries</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalEntries"
                >
                  {contentTypeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Content Types</p>
              <p className="text-2xl font-bold text-gray-900">{contentTypes.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Locales</p>
              <p className="text-2xl font-bold text-gray-900">{locales.length}</p>
            </div>
            <Globe className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Combinations</p>
              <p className="text-2xl font-bold text-gray-900">{adoptionData.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Content Type Summary */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Type Locale Summary
            </h3>
            <ExportButton 
              data={contentTypeSummary} 
              filename="content-type-locale-summary" 
              label="Export Summary"
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
                  Locales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Locales
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentTypeSummary.map((summary, index) => (
                <tr key={summary.contentType} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {summary.contentType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {summary.totalLocales} locale{summary.totalLocales !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {summary.totalEntries.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {summary.totalPublished.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {summary.topLocales.map((locale) => (
                        <span
                          key={locale.locale}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {locale.locale}: {locale.count}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Adoption Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Locale Adoption
            </h3>
            <div className="flex items-center gap-4">
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Content Types</option>
                {contentTypes.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Locales</option>
                {locales.map(locale => (
                  <option key={locale} value={locale}>{locale}</option>
                ))}
              </select>
              <ExportButton 
                data={filteredData} 
                filename="content-type-locale-adoption" 
                label="Export Data"
              />
            </div>
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
                  Locale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={`${item.contentType}_${item.locale}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.contentType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.localeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.locale}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Hash className="h-4 w-4 mr-1 text-gray-400" />
                      {item.totalEntries.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <TrendingUp className="h-4 w-4 mr-1 text-gray-400" />
                      {item.publishedEntries.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {item.activeUsers.length} user{item.activeUsers.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatRelativeTime(item.lastActivity)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
