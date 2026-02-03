import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type {
  TransformedStudy,
  TransformedOutcomeMeasure,
  TransformedComparison,
  TableView,
} from '@/lib/types'

type TableData = TransformedStudy | TransformedOutcomeMeasure | TransformedComparison

interface ResultsTableProps {
  data: TableData[]
  view: TableView
}

// Helper function to render NCT ID link
function renderNctIdCell(nctId: string) {
  return (
    <a
      href={`https://clinicaltrials.gov/study/${nctId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-primary hover:underline font-mono"
    >
      {nctId}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

// Column definitions for Studies view
function getStudiesColumns(): ColumnDef<TransformedStudy>[] {
  return [
    {
      accessorKey: 'nctId',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          NCT ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => renderNctIdCell(row.getValue('nctId')),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-md truncate" title={row.getValue('title')}>
          {row.getValue('title')}
        </div>
      ),
    },
    {
      accessorKey: 'conditions',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Conditions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('conditions')}>
          {row.getValue('conditions')}
        </div>
      ),
    },
    {
      accessorKey: 'sponsor',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sponsor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('sponsor')}>
          {row.getValue('sponsor')}
        </div>
      ),
    },
    {
      accessorKey: 'phase',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phase
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const phase = row.getValue('phase') as string
        return <Badge variant="outline">{phase}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return <Badge>{status}</Badge>
      },
    },
    {
      accessorKey: 'locationCount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Locations
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue('locationCount')}</div>,
    },
    {
      accessorKey: 'sponsorClass',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Funder Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'hasResults',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Has Results
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const hasResults = row.getValue('hasResults') as boolean
        return (
          <div className="flex justify-center">
            {hasResults ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-gray-400" />
            )}
          </div>
        )
      },
    },
  ]
}

// Column definitions for Outcomes view
function getOutcomesColumns(): ColumnDef<TransformedOutcomeMeasure>[] {
  return [
    {
      accessorKey: 'nctId',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          NCT ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => renderNctIdCell(row.getValue('nctId')),
    },
    {
      accessorKey: 'conditions',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Conditions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('conditions')}>
          {row.getValue('conditions')}
        </div>
      ),
    },
    {
      accessorKey: 'outcomeType',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Outcome Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue('outcomeType') as string
        return <Badge variant="outline">{type}</Badge>
      },
    },
    {
      accessorKey: 'endpoint',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Endpoint
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-md truncate" title={row.getValue('endpoint')}>
          {row.getValue('endpoint')}
        </div>
      ),
    },
    {
      accessorKey: 'timeFrame',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Time Frame
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('timeFrame')}>
          {row.getValue('timeFrame')}
        </div>
      ),
    },
    {
      accessorKey: 'unitOfMeasure',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Unit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('unitOfMeasure') || '-',
    },
    {
      accessorKey: 'groups',
      header: 'Groups',
      cell: ({ row }) => {
        const groups = row.getValue('groups') as TransformedOutcomeMeasure['groups']
        return (
          <div className="space-y-2 py-1">
            {groups.map((group, idx) => (
              <div key={idx} className="text-sm border-l-2 border-primary/30 pl-2">
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {group.n !== undefined && <div>N: {group.n}</div>}
                  {group.estimate && <div>Est: {group.estimate}</div>}
                  {group.se && <div>SE: {group.se}</div>}
                </div>
              </div>
            ))}
          </div>
        )
      },
    },
  ]
}

// Column definitions for Comparisons view
function getComparisonsColumns(): ColumnDef<TransformedComparison>[] {
  return [
    {
      accessorKey: 'nctId',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          NCT ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => renderNctIdCell(row.getValue('nctId')),
    },
    {
      accessorKey: 'conditions',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Conditions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('conditions')}>
          {row.getValue('conditions')}
        </div>
      ),
    },
    {
      accessorKey: 'outcomeType',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Outcome Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue('outcomeType') as string
        return <Badge variant="outline">{type}</Badge>
      },
    },
    {
      accessorKey: 'endpoint',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Endpoint
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-md truncate" title={row.getValue('endpoint')}>
          {row.getValue('endpoint')}
        </div>
      ),
    },
    {
      accessorKey: 'timeFrame',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Time Frame
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('timeFrame')}>
          {row.getValue('timeFrame')}
        </div>
      ),
    },
    {
      accessorKey: 'group1Name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Group 1
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('group1Name')}>
          {row.getValue('group1Name')}
        </div>
      ),
    },
    {
      accessorKey: 'group2Name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Group 2
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('group2Name')}>
          {row.getValue('group2Name')}
        </div>
      ),
    },
    {
      accessorKey: 'differenceEstimate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Difference
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('differenceEstimate') || '-',
    },
    {
      accessorKey: 'differenceSE',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          SE
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('differenceSE') || '-',
    },
    {
      accessorKey: 'pValue',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          P-Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('pValue') || '-',
    },
    {
      accessorKey: 'statisticalMethod',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Statistical Method
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('statisticalMethod')}>
          {row.getValue('statisticalMethod') || '-'}
        </div>
      ),
    },
    {
      id: 'confidenceInterval',
      header: 'Confidence Interval',
      cell: ({ row }) => {
        const ciLower = row.original.ciLowerLimit
        const ciUpper = row.original.ciUpperLimit
        const ciPct = row.original.ciPctValue
        if (ciLower && ciUpper) {
          return (
            <div className="text-sm">
              {ciPct ? `${ciPct}% CI: ` : 'CI: '}[{ciLower}, {ciUpper}]
            </div>
          )
        }
        return '-'
      },
    },
  ]
}

// Main function to get columns based on view
function getColumnsForView(view: TableView): ColumnDef<TableData>[] {
  switch (view) {
    case 'studies':
      return getStudiesColumns() as ColumnDef<TableData>[]
    case 'outcomes':
      return getOutcomesColumns() as ColumnDef<TableData>[]
    case 'comparisons':
      return getComparisonsColumns() as ColumnDef<TableData>[]
    default:
      return getStudiesColumns() as ColumnDef<TableData>[]
  }
}

export function ResultsTable({ data, view }: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TableData>[]>(() => getColumnsForView(view), [view])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No results yet</p>
        <p className="text-sm mt-2">Run a query to see clinical trial data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} {data.length === 1 ? 'result' : 'results'}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="hidden sm:inline">Scroll horizontally to see all columns →</span>
        </div>
      </div>

      <div
        className="border border-border overflow-x-auto overflow-y-auto"
        style={{
          height: '660px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--primary)) transparent',
        }}
      >
        <div className="min-w-max">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="bg-background">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
