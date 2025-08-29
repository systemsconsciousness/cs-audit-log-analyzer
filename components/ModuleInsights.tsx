'use client'

import { getModuleColor } from '@/lib/utils'
import { Code, Hash, Users, Building2 } from 'lucide-react'

interface ModuleInsightsProps {
  modules: any[]
}

export function ModuleInsights({ modules }: ModuleInsightsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Module Activity Analysis
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div key={module.module} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 
                    className="font-semibold text-white px-3 py-1 rounded text-sm"
                    style={{ backgroundColor: getModuleColor(module.module) }}
                  >
                    {module.module || 'Unknown'}
                  </h4>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      {module.totalEvents.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      Users
                    </div>
                    <span className="font-medium">{module.uniqueUsers}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="h-4 w-4 mr-1" />
                      Orgs
                    </div>
                    <span className="font-medium">{module.uniqueOrgs}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <h5 className="text-xs font-medium text-gray-500 mb-2">Top Events</h5>
                  <div className="space-y-1">
                    {Object.entries(module.events)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 3)
                      .map(([event, count]) => (
                        <div key={event} className="flex justify-between text-xs">
                          <span className="text-gray-600">{event}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
