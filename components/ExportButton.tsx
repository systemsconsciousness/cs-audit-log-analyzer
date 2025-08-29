'use client'

import { useState } from 'react'
import { Download, FileText, Database } from 'lucide-react'
import { exportToCSV, exportToJSON, flattenForExport } from '@/lib/export-utils'

interface ExportButtonProps {
  data: any[]
  filename: string
  label?: string
  className?: string
  flatten?: boolean
}

export function ExportButton({ 
  data, 
  filename, 
  label = "Export", 
  className = "",
  flatten = true 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExportCSV = () => {
    const exportData = flatten ? flattenForExport(data) : data
    exportToCSV(exportData, `${filename}-${new Date().toISOString().split('T')[0]}`)
    setIsOpen(false)
  }

  const handleExportJSON = () => {
    exportToJSON(data, `${filename}-${new Date().toISOString().split('T')[0]}`)
    setIsOpen(false)
  }

  if (data.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors ${className}`}
      >
        <Download className="h-4 w-4" />
        {label}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4" />
              Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Database className="h-4 w-4" />
              Export as JSON
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
