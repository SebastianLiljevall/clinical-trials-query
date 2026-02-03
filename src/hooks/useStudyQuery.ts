import { useState, useRef, useCallback, useMemo } from 'react'
import { fetchStudies } from '@/lib/api'
import { transformStudies, applyFilters } from '@/lib/transformers'
import { transformToOutcomeMeasures } from '@/lib/outcomeMeasuresTransformer'
import { transformToComparisons } from '@/lib/comparisonsTransformer'
import type {
  QueryParams,
  Study,
  TransformedStudy,
  TransformedOutcomeMeasure,
  TransformedComparison,
  TableView,
} from '@/lib/types'

interface UseStudyQueryResult {
  isLoading: boolean
  error: string | null
  results: Study[]
  filteredResults: TransformedStudy[]
  currentView: TableView
  setCurrentView: (view: TableView) => void
  shouldShowResults: boolean
  outcomeMeasures: TransformedOutcomeMeasure[]
  comparisons: TransformedComparison[]
  executeQuery: (params: QueryParams) => Promise<void>
  cancelQuery: () => void
}

export function useStudyQuery(): UseStudyQueryResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Study[]>([])
  const [filteredResults, setFilteredResults] = useState<TransformedStudy[]>([])
  const [currentView, setCurrentView] = useState<TableView>('studies')
  const [lastQueryParams, setLastQueryParams] = useState<QueryParams | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Compute shouldShowResults based on last query params
  const shouldShowResults = useMemo(() => {
    return lastQueryParams?.hasResults === true
  }, [lastQueryParams])

  // Compute outcome measures from filtered results
  const outcomeMeasures = useMemo(() => {
    if (!shouldShowResults) return []
    // Get original studies that match filtered results
    const filteredNctIds = new Set(filteredResults.map(r => r.nctId))
    const filteredStudies = results.filter(s =>
      filteredNctIds.has(s.protocolSection.identificationModule.nctId)
    )
    return transformToOutcomeMeasures(filteredStudies)
  }, [filteredResults, results, shouldShowResults])

  // Compute comparisons from filtered results
  const comparisons = useMemo(() => {
    if (!shouldShowResults) return []
    // Get original studies that match filtered results
    const filteredNctIds = new Set(filteredResults.map(r => r.nctId))
    const filteredStudies = results.filter(s =>
      filteredNctIds.has(s.protocolSection.identificationModule.nctId)
    )
    return transformToComparisons(filteredStudies)
  }, [filteredResults, results, shouldShowResults])

  const executeQuery = useCallback(async (params: QueryParams) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)
    setLastQueryParams(params)

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
    currentView,
    setCurrentView,
    shouldShowResults,
    outcomeMeasures,
    comparisons,
    executeQuery,
    cancelQuery,
  }
}
