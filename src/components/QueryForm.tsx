import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { QueryParams } from '@/lib/types'

interface QueryFormProps {
  onSubmit: (params: QueryParams) => void
  isLoading: boolean
  onCancel: () => void
}

const PHASE_OPTIONS = [
  { value: 'EARLY_PHASE1', label: 'Early Phase 1' },
  { value: 'PHASE1', label: 'Phase 1' },
  { value: 'PHASE2', label: 'Phase 2' },
  { value: 'PHASE3', label: 'Phase 3' },
  { value: 'PHASE4', label: 'Phase 4' },
  { value: 'NA', label: 'N/A' },
]

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'RECRUITING', label: 'Recruiting' },
  { value: 'ACTIVE_NOT_RECRUITING', label: 'Active, not recruiting' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

const RESULT_LIMIT_OPTIONS = [
  { value: 100, label: '100' },
  { value: 500, label: '500' },
  { value: 1000, label: '1000' },
]

export function QueryForm({ onSubmit, isLoading, onCancel }: QueryFormProps) {
  const [condition, setCondition] = useState('')
  const [descriptionSearch, setDescriptionSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [hasResults, setHasResults] = useState(false)
  const [selectedPhases, setSelectedPhases] = useState<string[]>([])
  const [resultLimit, setResultLimit] = useState(100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params: QueryParams = {
      condition: condition || undefined,
      descriptionSearch: descriptionSearch || undefined,
      status: status === 'ALL' ? undefined : status,
      hasResults,
      phases: selectedPhases.length > 0 ? selectedPhases : undefined,
      resultLimit,
    }

    onSubmit(params)
  }

  const handlePhaseToggle = (phase: string) => {
    setSelectedPhases(prev =>
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    )
  }

  const handleClear = () => {
    setCondition('')
    setDescriptionSearch('')
    setStatus('ALL')
    setHasResults(false)
    setSelectedPhases([])
    setResultLimit(100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Clinical Trials</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition / Disease</Label>
            <Input
              id="condition"
              placeholder="e.g., MSA, Alzheimer's Disease"
              value={condition}
              onChange={e => setCondition(e.target.value)}
            />
          </div>

          {/* Description Search */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description Search
              <span className="text-sm text-muted-foreground ml-2">
                (searches in descriptions and outcome measures)
              </span>
            </Label>
            <Input
              id="description"
              placeholder="e.g., CDR-SB, cognitive assessment"
              value={descriptionSearch}
              onChange={e => setDescriptionSearch(e.target.value)}
            />
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Study Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Has Results */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasResults"
              checked={hasResults}
              onCheckedChange={checked => setHasResults(checked === true)}
            />
            <Label htmlFor="hasResults" className="cursor-pointer">
              Only studies with published results
            </Label>
          </div>

          {/* Phase */}
          <div className="space-y-2">
            <Label>Study Phase</Label>
            <div className="grid grid-cols-2 gap-2">
              {PHASE_OPTIONS.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`phase-${option.value}`}
                    checked={selectedPhases.includes(option.value)}
                    onCheckedChange={() => handlePhaseToggle(option.value)}
                  />
                  <Label htmlFor={`phase-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Result Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Result Limit</Label>
            <Select
              value={resultLimit.toString()}
              onValueChange={val => setResultLimit(Number(val))}
            >
              <SelectTrigger id="limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULT_LIMIT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Running Query...' : 'Run Query'}
            </Button>
            {isLoading && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {!isLoading && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
