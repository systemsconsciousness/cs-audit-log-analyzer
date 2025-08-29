import Papa from 'papaparse'
import { AuditLogData, ProcessedAuditLog } from '@/types/audit-log'

export const parseCSV = (file: File): Promise<ProcessedAuditLog[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedData = results.data.map((row: any) => {
            const auditLog: AuditLogData = {
              app_type: row.app_type || '',
              branch: row.branch || '',
              channels: row.channels || '',
              created_at: row.created_at || '',
              created_by: row.created_by || '',
              event: row.event || '',
              headers: row.headers || '',
              launch_deployment_uid: row.launch_deployment_uid || '',
              launch_environment_uid: row.launch_environment_uid || '',
              launch_project_uid: row.launch_project_uid || '',
              management_token_uid: row.management_token_uid || '',
              metadata: row.metadata || '',
              module: row.module || '',
              module_uid: row.module_uid || '',
              org_uid: row.org_uid || '',
              payload: row.payload || '',
              project_uid: row.project_uid || '',
              remote_addr: row.remote_addr || '',
              request: row.request || '',
              request_id: row.request_id || '',
              response: row.response || '',
              sort: row.sort || '',
              stack: row.stack || '',
              uid: row.uid || '',
              vendor_uid: row.vendor_uid || ''
            }

            const processed: ProcessedAuditLog = {
              ...auditLog,
              timestamp: new Date(auditLog.created_at)
            }

            // Parse JSON fields safely
            try {
              if (auditLog.metadata && auditLog.metadata !== 'null' && auditLog.metadata.trim() !== '') {
                processed.parsedMetadata = JSON.parse(auditLog.metadata)
              }
            } catch (e) {
              // Keep original string if parsing fails
            }

            try {
              if (auditLog.payload && auditLog.payload !== 'null' && auditLog.payload.trim() !== '') {
                processed.parsedPayload = JSON.parse(auditLog.payload)
              }
            } catch (e) {
              // Keep original string if parsing fails
            }

            try {
              if (auditLog.request && auditLog.request !== 'null' && auditLog.request.trim() !== '') {
                processed.parsedRequest = JSON.parse(auditLog.request)
              }
            } catch (e) {
              // Keep original string if parsing fails
            }

            try {
              if (auditLog.response && auditLog.response !== 'null' && auditLog.response.trim() !== '') {
                processed.parsedResponse = JSON.parse(auditLog.response)
              }
            } catch (e) {
              // Keep original string if parsing fails
            }

            return processed
          })

          resolve(processedData.filter(item => item.created_at)) // Filter out empty rows
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}
