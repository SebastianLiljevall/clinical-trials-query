import type { QueryParams, StudyResponse } from './types'

const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies'

export function buildQueryUrl(params: QueryParams): string {
  const url = new URL(API_BASE_URL)

  // Add format
  url.searchParams.append('format', 'json')

  // Add page size
  url.searchParams.append('pageSize', params.resultLimit.toString())

  // Add condition filter
  if (params.condition) {
    url.searchParams.append('query.cond', params.condition)
  }

  // Add status filter
  if (params.status) {
    url.searchParams.append('filter.overallStatus', params.status)
  }

  return url.toString()
}

export async function fetchStudies(
  params: QueryParams,
  signal?: AbortSignal
): Promise<StudyResponse> {
  const url = buildQueryUrl(params)

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
