'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, AlertCircle, Github } from 'lucide-react'
import { parseCSV } from '@/lib/csv-parser'
import { ProcessedAuditLog } from '@/types/audit-log'
import { formatBytes } from '@/lib/utils'

interface FileUploadProps {
  onDataLoaded: (data: ProcessedAuditLog[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function FileUpload({ onDataLoaded, isLoading, setIsLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const data = await parseCSV(file)
      if (data.length === 0) {
        setError('No valid data found in the CSV file')
        return
      }
      onDataLoaded(data)
    } catch (err) {
      setError('Failed to parse CSV file. Please check the file format.')
      console.error('CSV parsing error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [onDataLoaded, setIsLoading])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isLoading ? 'Processing...' : 'Upload Audit Log CSV'}
            </h3>
            <p className="text-gray-600">
              {isLoading 
                ? 'Parsing your audit log data...' 
                : 'Drag and drop your Contentstack audit log CSV file here, or click to browse'
              }
            </p>
          </div>
          
          {!isLoading && (
            <div className="text-sm text-gray-500">
              <FileText className="inline h-4 w-4 mr-1" />
              Supports CSV files up to {formatBytes(50 * 1024 * 1024)}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-gray-500">
          Your CSV file is processed locally in your browser. No data is uploaded to any server.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Demo purposes only.</span>
          <a 
            href="https://github.com/systemsconsciousness/cs-audit-log-analyzer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <Github className="h-4 w-4" />
            View source code on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
