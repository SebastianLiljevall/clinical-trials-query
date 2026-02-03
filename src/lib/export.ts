import type { TransformedStudy } from './types'

export function exportToCSV(studies: TransformedStudy[]): string {
  if (studies.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(studies[0]) as Array<keyof TransformedStudy>

  // Create header row
  const headerRow = headers.join(',')

  // Create data rows
  const dataRows = studies.map(study => {
    return headers
      .map(key => {
        const value = study[key]

        // Handle undefined/null
        if (value === undefined || value === null) return ''

        // Convert to string
        const stringValue = String(value)

        // Escape if contains comma, quote, or newline
        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }

        return stringValue
      })
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export function exportToJSON(studies: TransformedStudy[]): string {
  return JSON.stringify(studies, null, 2)
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generateFilename(format: 'csv' | 'json'): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `clinical-trials-${year}-${month}-${day}-${hours}${minutes}${seconds}.${format}`
}
