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
import type { TransformedStudy } from '@/lib/types'

interface ResultsTableProps {
  data: TransformedStudy[]
}

export function ResultsTable({ data }: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TransformedStudy>[]>(
    () => [
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
        cell: ({ row }) => {
          const nctId = row.getValue('nctId') as string
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
        },
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
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('locationCount')}</div>
        ),
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
    ],
    []
  )

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
    <div className="space-y-4 h-full flex flex-col min-h-0">
      <div className="text-sm text-muted-foreground flex-shrink-0">
        Showing {data.length} {data.length === 1 ? 'result' : 'results'}
      </div>

      <div className="rounded-md border flex-1 min-h-0 relative overflow-x-auto">
        <div className="absolute inset-0 overflow-y-auto overflow-x-visible">
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
                <TableRow key={row.id}>
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
