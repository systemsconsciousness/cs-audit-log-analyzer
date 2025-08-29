'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Dashboard } from '@/components/Dashboard'
import { AuditLogData } from '@/types/audit-log'

export default function Home() {
  const [auditData, setAuditData] = useState<AuditLogData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleDataLoaded = (data: AuditLogData[]) => {
    setAuditData(data)
  }

  return (
    <main className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contentstack Audit Log Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your Contentstack audit log CSV file to analyze user activity, 
            content operations, and system usage patterns with interactive visualizations.
          </p>
        </div>

        {auditData.length === 0 ? (
          <FileUpload 
            onDataLoaded={handleDataLoaded} 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <Dashboard 
            data={auditData} 
            onReset={() => setAuditData([])} 
          />
        )}
      </div>
    </main>
  )
}
