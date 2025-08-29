'use client'

import { useMemo, useState } from 'react'
import { ProcessedAuditLog } from '@/types/audit-log'
import { analyzeAuditLogs, analyzeUserActivity, analyzeOrgActivity, analyzeContentTypeActivity, getModuleInsights, analyzeStackActivity, analyzeLocaleActivity, analyzeUserEngagement, analyzePublishMetrics, analyzeContentTypeLocaleAdoption, analyzeStackUserMetrics } from '@/lib/analytics'
import { OverviewCards } from './OverviewCards'
import { OverviewCharts } from './OverviewCharts'
import { EventsChart } from './EventsChart'
import { ActivityHeatmap } from './ActivityHeatmap'
import { TopUsersTable } from './TopUsersTable'
import { TopOrgsTable } from './TopOrgsTable'
import { RecentActivityTable } from './RecentActivityTable'
import { ModuleInsights } from './ModuleInsights'
import { ContentTypeAnalysis } from './ContentTypeAnalysis'
import { StackAnalysisTable } from './StackAnalysisTable'
import { LocaleAnalysisTable } from './LocaleAnalysisTable'
import { PublishMetricsTable } from './PublishMetricsTable'
import { ContentTypeLocaleAdoptionTable } from './ContentTypeLocaleAdoption'
import { StackUserMetricsTable } from './StackUserMetricsTable'
import { RefreshCw, Download } from 'lucide-react'

interface DashboardProps {
  data: ProcessedAuditLog[]
  onReset: () => void
}

export function Dashboard({ data, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const analytics = useMemo(() => analyzeAuditLogs(data), [data])
  const userActivity = useMemo(() => analyzeUserActivity(data), [data])
  const orgActivity = useMemo(() => analyzeOrgActivity(data), [data])
  const contentTypeActivity = useMemo(() => analyzeContentTypeActivity(data), [data])
  const moduleInsights = useMemo(() => getModuleInsights(data), [data])
  const stackActivity = useMemo(() => analyzeStackActivity(data), [data])
  const localeActivity = useMemo(() => analyzeLocaleActivity(data), [data])
  const userEngagement = useMemo(() => analyzeUserEngagement(data), [data])
  const publishMetrics = useMemo(() => analyzePublishMetrics(data), [data])
  const contentTypeLocaleAdoption = useMemo(() => analyzeContentTypeLocaleAdoption(data), [data])
  const stackUserMetrics = useMemo(() => analyzeStackUserMetrics(data), [data])

  const exportData = () => {
    const exportObj = {
      summary: analytics,
      userActivity,
      userEngagement,
      orgActivity,
      stackActivity,
      localeActivity,
      contentTypeActivity,
      moduleInsights,
      publishMetrics,
      contentTypeLocaleAdoption,
      stackUserMetrics,
      exportedAt: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportObj, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contentstack-audit-analysis-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'stacks', label: 'Stacks' },
    { id: 'locales', label: 'Locales' },
    { id: 'content', label: 'Content Types' },
    { id: 'publishing', label: 'Publishing' },
    { id: 'adoption', label: 'Locale Adoption' },
    { id: 'modules', label: 'Modules' },
    { id: 'activity', label: 'Recent Activity' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Audit Log Analysis</h2>
            <p className="text-muted-foreground mt-1">
              Analyzing {analytics.totalEvents.toLocaleString()} events from {analytics.uniqueUsers} users across {analytics.uniqueStacks} stacks
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#7c4dff' }}
            >
              <Download className="h-4 w-4" />
              Export Analysis
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#253143' }}
            >
              <RefreshCw className="h-4 w-4" />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                style={activeTab === tab.id ? { borderColor: '#7c4dff' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <OverviewCards analytics={analytics} />
              <OverviewCharts analytics={analytics} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EventsChart data={analytics.eventsByDay} title="Events Over Time" />
                <ActivityHeatmap data={analytics.eventsByHour} />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <TopUsersTable users={userActivity} userEngagement={userEngagement} analytics={analytics} />
            </div>
          )}

          {activeTab === 'stacks' && (
            <div className="space-y-6">
              <StackAnalysisTable stacks={stackActivity} />
              <StackUserMetricsTable stackMetrics={stackUserMetrics} />
            </div>
          )}

          {activeTab === 'locales' && (
            <div className="space-y-6">
              <LocaleAnalysisTable locales={localeActivity} />
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <ContentTypeAnalysis contentTypes={contentTypeActivity} />
            </div>
          )}

          {activeTab === 'publishing' && (
            <div className="space-y-6">
              <PublishMetricsTable metrics={publishMetrics} />
            </div>
          )}

          {activeTab === 'adoption' && (
            <div className="space-y-6">
              <ContentTypeLocaleAdoptionTable adoptionData={contentTypeLocaleAdoption} />
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-6">
              <ModuleInsights modules={moduleInsights} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <RecentActivityTable activities={analytics.recentActivity} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
