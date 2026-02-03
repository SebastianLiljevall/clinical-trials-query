import { useState, useRef, useCallback } from 'react'
import { fetchStudies } from '@/lib/api'
import { transformStudies, applyFilters } from '@/lib/transformers'
import type { QueryParams, Study, TransformedStudy } from '@/lib/types'

interface UseStudyQueryResult {
  isLoading: boolean
  error: string | null
  results: Study[]
  filteredResults: TransformedStudy[]
  executeQuery: (params: QueryParams) => Promise<void>
  cancelQuery: () => void
}

export function useStudyQuery(): UseStudyQueryResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Study[]>([])
  const [filteredResults, setFilteredResults] = useState<TransformedStudy[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)

  const executeQuery = useCallback(async (params: QueryParams) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      // Fetch from API
      const response = await fetchStudies(params, abortControllerRef.current.signal)

      const studies = response.studies || []

      // Apply client-side filters
      const filtered = applyFilters(studies, {
        descriptionSearch: params.descriptionSearch,
        phases: params.phases,
        hasResults: params.hasResults,
      })

      // Transform for display
      const transformed = transformStudies(filtered)

      setResults(studies)
      setFilteredResults(transformed)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Query was cancelled, don't set error
          return
        }
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelQuery = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    results,
    filteredResults,
    executeQuery,
    cancelQuery,
  }
}
