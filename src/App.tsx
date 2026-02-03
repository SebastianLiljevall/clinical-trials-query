import { useState } from 'react'
import { QueryForm } from '@/components/QueryForm'
import { ResultsTable } from '@/components/ResultsTable'
import { ExportButtons } from '@/components/ExportButtons'
import { Toaster } from '@/components/Toaster'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import { useStudyQuery } from '@/hooks/useStudyQuery'
import type { QueryParams } from '@/lib/types'

function App() {
  const { isLoading, error, filteredResults, executeQuery, cancelQuery } = useStudyQuery()
  const [showApiQuery, setShowApiQuery] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>('')

  const handleSubmit = (params: QueryParams) => {
    // Build API query URL for display
    const url = new URL('https://clinicaltrials.gov/api/v2/studies')
    url.searchParams.append('format', 'json')
    url.searchParams.append('pageSize', params.resultLimit.toString())
    if (params.condition) url.searchParams.append('query.cond', params.condition)
    if (params.status) url.searchParams.append('filter.overallStatus', params.status)

    setLastQuery(url.toString())
    executeQuery(params)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Clinical Trials Query Tool</h1>
            <p className="text-muted-foreground">
              Search and download clinical trial data from ClinicalTrials.gov
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Separator />

        {/* Two-column layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          style={{ height: 'calc(100vh - 16rem)' }}
        >
          {/* Query Form - left column */}
          <div className="lg:col-span-1 overflow-auto">
            <QueryForm onSubmit={handleSubmit} isLoading={isLoading} onCancel={cancelQuery} />
          </div>

          {/* Results - right column */}
          <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-shrink-0">
              <ExportButtons data={filteredResults} disabled={isLoading} />

              {lastQuery && (
                <button
                  onClick={() => setShowApiQuery(!showApiQuery)}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  {showApiQuery ? 'Hide' : 'Show'} API Query
                </button>
              )}
            </div>

            {/* API Query Display */}
            {showApiQuery && lastQuery && (
              <Alert className="flex-shrink-0">
                <AlertDescription className="font-mono text-xs break-all">
                  {lastQuery}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="flex-shrink-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12 text-muted-foreground flex-1 flex items-center justify-center">
                <div>
                  <p className="text-lg">Querying ClinicalTrials.gov...</p>
                  <p className="text-sm mt-2">This may take a few moments</p>
                </div>
              </div>
            )}

            {/* Results Table */}
            {!isLoading && <ResultsTable data={filteredResults} />}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
