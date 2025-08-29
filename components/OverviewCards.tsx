'use client'

import { AnalyticsData } from '@/types/audit-log'
import { formatNumber } from '@/lib/utils'
import { Users, Database, Activity, Clock } from 'lucide-react'

interface OverviewCardsProps {
  analytics: AnalyticsData
}

export function OverviewCards({ analytics }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Events',
      value: formatNumber(analytics.totalEvents),
      icon: Activity,
      color: '#7c4dff'
    },
    {
      title: 'Unique Users',
      value: formatNumber(analytics.uniqueUsers),
      icon: Users,
      color: '#1783ff'
    },
    {
      title: 'Active Stacks',
      value: formatNumber(analytics.uniqueStacks),
      icon: Database,
      color: '#ec3cdb'
    },
    {
      title: 'Active in 90 Days',
      value: `${analytics.userActivitySummary.activeInLast90Days}/${analytics.userActivitySummary.totalUsers}`,
      icon: Clock,
      color: '#eb5646'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: card.color }}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
