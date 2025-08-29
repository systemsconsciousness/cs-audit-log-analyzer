export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        } else if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // For now, we'll export as CSV since Excel can open CSV files
  // In a production app, you might want to use a library like xlsx
  exportToCSV(data, filename)
}

// Utility to flatten complex objects for CSV export
export const flattenForExport = (data: any[]): any[] => {
  return data.map(item => {
    const flattened: any = {}
    
    Object.keys(item).forEach(key => {
      const value = item[key]
      
      if (Array.isArray(value)) {
        flattened[key] = value.join('; ')
        flattened[`${key}_count`] = value.length
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        // Flatten object properties
        Object.keys(value).forEach(subKey => {
          flattened[`${key}_${subKey}`] = value[subKey]
        })
      } else if (value instanceof Date) {
        flattened[key] = value.toISOString()
      } else {
        flattened[key] = value
      }
    })
    
    return flattened
  })
}
