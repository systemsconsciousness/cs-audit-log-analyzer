'use client'

import { AnalyticsData } from '@/types/audit-log'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface OverviewChartsProps {
  analytics: AnalyticsData
}

export function OverviewCharts({ analytics }: OverviewChartsProps) {
  // Module activity bar chart data
  const moduleData = Object.entries(analytics.eventsByModule)
    .map(([module, count]) => ({ name: module, events: count }))
    .sort((a, b) => b.events - a.events)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Module Activity - Full Width */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Module Activity</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleData}>
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
              <Bar dataKey="events" fill="#1783ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Activity Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">User Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
            <div>
              <div className="text-sm font-medium" style={{ color: '#7c4dff' }}>Active in Last 30 Days</div>
              <div className="text-2xl font-bold text-foreground">
                {analytics.userActivitySummary.activeInLast30Days}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((analytics.userActivitySummary.activeInLast30Days / analytics.userActivitySummary.totalUsers) * 100)}% of total
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
            <div>
              <div className="text-sm font-medium" style={{ color: '#1783ff' }}>Active in Last 90 Days</div>
              <div className="text-2xl font-bold text-foreground">
                {analytics.userActivitySummary.activeInLast90Days}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((analytics.userActivitySummary.activeInLast90Days / analytics.userActivitySummary.totalUsers) * 100)}% of total
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
            <div>
              <div className="text-sm font-medium" style={{ color: '#ec3cdb' }}>Content Types Used (90d)</div>
              <div className="text-2xl font-bold text-foreground">
                {analytics.contentTypeUsageSummary.usedInLast90Days}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((analytics.contentTypeUsageSummary.usedInLast90Days / analytics.contentTypeUsageSummary.totalContentTypes) * 100)}% adoption
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
