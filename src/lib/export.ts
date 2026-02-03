import type { TransformedStudy, TransformedOutcomeMeasure, TransformedComparison } from './types'

// Helper function to escape CSV values
function escapeCSV(value: string | number | boolean | undefined | null): string {
  // Handle undefined/null
  if (value === undefined || value === null) return ''

  // Convert to string
  const stringValue = String(value)

  // Escape if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

export function exportToCSV(studies: TransformedStudy[]): string {
  if (studies.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(studies[0]) as Array<keyof TransformedStudy>

  // Create header row
  const headerRow = headers.join(',')

  // Create data rows
  const dataRows = studies.map(study => {
    return headers.map(key => escapeCSV(study[key])).join(',')
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

// Helper function to generate timestamp for filenames
function generateTimestamp(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`
}

export function generateOutcomeMeasuresCSV(outcomes: TransformedOutcomeMeasure[]): string {
  if (outcomes.length === 0) return ''

  // Find maximum number of groups across all outcomes
  const maxGroups = Math.max(...outcomes.map(o => o.groups.length))

  // Build header row
  const baseHeaders = [
    'NCT ID',
    'Conditions',
    'Outcome Type',
    'Endpoint',
    'Time Frame',
    'Unit of Measure',
  ]

  const groupHeaders: string[] = []
  for (let i = 1; i <= maxGroups; i++) {
    groupHeaders.push(`Group ${i} Name`, `Group ${i} N`, `Group ${i} Estimate`, `Group ${i} SE`)
  }

  const headers = [...baseHeaders, ...groupHeaders]
  const headerRow = headers.join(',')

  // Build data rows
  const dataRows = outcomes.map(outcome => {
    const baseValues = [
      escapeCSV(outcome.nctId),
      escapeCSV(outcome.conditions),
      escapeCSV(outcome.outcomeType),
      escapeCSV(outcome.endpoint),
      escapeCSV(outcome.timeFrame),
      escapeCSV(outcome.unitOfMeasure),
    ]

    // Add group data
    const groupValues: string[] = []
    for (let i = 0; i < maxGroups; i++) {
      const group = outcome.groups[i]
      if (group) {
        groupValues.push(
          escapeCSV(group.name),
          escapeCSV(group.n),
          escapeCSV(group.estimate),
          escapeCSV(group.se)
        )
      } else {
        // Fill with empty values if group doesn't exist
        groupValues.push('', '', '', '')
      }
    }

    return [...baseValues, ...groupValues].join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export function generateComparisonsCSV(comparisons: TransformedComparison[]): string {
  if (comparisons.length === 0) return ''

  // Fixed headers for comparisons
  const headers = [
    'NCT ID',
    'Conditions',
    'Outcome Type',
    'Endpoint',
    'Time Frame',
    'Group 1',
    'Group 2',
    'Difference Estimate',
    'Difference SE',
    'P Value',
    'Statistical Method',
    'CI Lower',
    'CI Upper',
    'CI %',
  ]

  const headerRow = headers.join(',')

  // Build data rows
  const dataRows = comparisons.map(comparison => {
    return [
      escapeCSV(comparison.nctId),
      escapeCSV(comparison.conditions),
      escapeCSV(comparison.outcomeType),
      escapeCSV(comparison.endpoint),
      escapeCSV(comparison.timeFrame),
      escapeCSV(comparison.group1Name),
      escapeCSV(comparison.group2Name),
      escapeCSV(comparison.differenceEstimate),
      escapeCSV(comparison.differenceSE),
      escapeCSV(comparison.pValue),
      escapeCSV(comparison.statisticalMethod),
      escapeCSV(comparison.ciLowerLimit),
      escapeCSV(comparison.ciUpperLimit),
      escapeCSV(comparison.ciPctValue),
    ].join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export function exportStudiesCSV(studies: TransformedStudy[]): void {
  const csv = exportToCSV(studies)
  const timestamp = generateTimestamp()
  const filename = `clinical-trials-studies-${timestamp}.csv`
  downloadFile(csv, filename, 'text/csv')
}

export function exportOutcomeMeasuresCSV(outcomes: TransformedOutcomeMeasure[]): void {
  const csv = generateOutcomeMeasuresCSV(outcomes)
  const timestamp = generateTimestamp()
  const filename = `clinical-trials-outcomes-${timestamp}.csv`
  downloadFile(csv, filename, 'text/csv')
}

export function exportComparisonsCSV(comparisons: TransformedComparison[]): void {
  const csv = generateComparisonsCSV(comparisons)
  const timestamp = generateTimestamp()
  const filename = `clinical-trials-comparisons-${timestamp}.csv`
  downloadFile(csv, filename, 'text/csv')
}
