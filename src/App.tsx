import { useState } from 'react'
import { QueryForm } from '@/components/QueryForm'
import { ResultsTable } from '@/components/ResultsTable'
import { TableViewToggle } from '@/components/TableViewToggle'
import { Toaster } from '@/components/Toaster'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { AlertCircle, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { useStudyQuery } from '@/hooks/useStudyQuery'
import { useToast } from '@/hooks/use-toast'
import {
  exportStudiesCSV,
  exportOutcomeMeasuresCSV,
  exportComparisonsCSV,
} from '@/lib/export'
import type { QueryParams } from '@/lib/types'

function App() {
  const {
    isLoading,
    error,
    filteredResults,
    currentView,
    setCurrentView,
    shouldShowResults,
    outcomeMeasures,
    comparisons,
    executeQuery,
    cancelQuery,
  } = useStudyQuery()
  const [showApiQuery, setShowApiQuery] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>('')
  const [isQueryFormOpen, setIsQueryFormOpen] = useState(true)
  const { toast } = useToast()

  // Determine current data based on view
  const currentData =
    currentView === 'studies'
      ? filteredResults
      : currentView === 'outcomes'
        ? outcomeMeasures
        : comparisons

  // Export handlers for each view
  const handleExportCSV = () => {
    try {
      if (currentView === 'studies') {
        exportStudiesCSV(filteredResults)
      } else if (currentView === 'outcomes') {
        exportOutcomeMeasuresCSV(outcomeMeasures)
      } else {
        exportComparisonsCSV(comparisons)
      }

      toast({
        title: 'Export successful',
        description: `Downloaded ${currentData.length} ${currentView} as CSV`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleExportJSON = () => {
    try {
      // JSON export: just download as JSON
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\..+/, '')
        .replace('T', '-')
      const filename = `clinical-trials-${currentView}-${timestamp}.json`
      const content = JSON.stringify(currentData, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `Downloaded ${currentData.length} ${currentView} as JSON`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1800px]">
        {/* Header - Clean & Simple */}
        <div className="space-y-2">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-foreground">
            Clinical Trials Query
          </h1>
          <p className="text-muted-foreground text-lg">
            Search and analyze clinical trial data from ClinicalTrials.gov
          </p>
        </div>

        <Separator className="bg-border" />

        {/* Two-column layout optimized for 1920x1080, stacks on mobile */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 xl:items-start">
          {/* Left Column - Query Form */}
          <div className="xl:col-span-4 flex flex-col">
            <Collapsible open={isQueryFormOpen} onOpenChange={setIsQueryFormOpen}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg xl:text-xl font-semibold">Query Parameters</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-muted">
                    {isQueryFormOpen ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Expand</span>
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="transition-all data-[state=closed]:animate-[collapsible-up_200ms] data-[state=open]:animate-[collapsible-down_200ms]">
                <div className="xl:sticky xl:top-8">
                  <QueryForm onSubmit={handleSubmit} isLoading={isLoading} onCancel={cancelQuery} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Right Column - Results */}
          <div className="xl:col-span-8 space-y-4">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    disabled={isLoading || currentData.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span> CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportJSON}
                    disabled={isLoading || currentData.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span> JSON
                  </Button>
                </div>

                {/* Table View Toggle - Only show when hasResults filter is enabled */}
                {shouldShowResults && !isLoading && filteredResults.length > 0 && (
                  <TableViewToggle
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                )}
              </div>

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
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Querying ClinicalTrials.gov...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            )}

            {/* Results Table */}
            {!isLoading && (
              <ResultsTable
                data={currentData as any}
              />
            )}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
