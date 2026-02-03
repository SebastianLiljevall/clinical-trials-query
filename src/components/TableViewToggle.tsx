import { Button } from '@/components/ui/button'
import type { TableView } from '@/lib/types'

interface TableViewToggleProps {
  currentView: TableView
  onViewChange: (view: TableView) => void
}

export function TableViewToggle({ currentView, onViewChange }: TableViewToggleProps) {
  return (
    <div role="tablist" className="flex gap-2">
      <Button
        role="tab"
        aria-selected={currentView === 'studies'}
        aria-controls="studies-table"
        variant={currentView === 'studies' ? 'default' : 'outline'}
        onClick={() => onViewChange('studies')}
      >
        Studies
      </Button>
      <Button
        role="tab"
        aria-selected={currentView === 'outcomes'}
        aria-controls="outcomes-table"
        variant={currentView === 'outcomes' ? 'default' : 'outline'}
        onClick={() => onViewChange('outcomes')}
      >
        Outcome Measures
      </Button>
      <Button
        role="tab"
        aria-selected={currentView === 'comparisons'}
        aria-controls="comparisons-table"
        variant={currentView === 'comparisons' ? 'default' : 'outline'}
        onClick={() => onViewChange('comparisons')}
      >
        Comparisons
      </Button>
    </div>
  )
}
