import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV, exportToJSON, downloadFile, generateFilename } from '@/lib/export'
import type { TransformedStudy } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface ExportButtonsProps {
  data: TransformedStudy[]
  disabled?: boolean
}

export function ExportButtons({ data, disabled }: ExportButtonsProps) {
  const { toast } = useToast()

  const handleExportCSV = () => {
    try {
      const csv = exportToCSV(data)
      const filename = generateFilename('csv')
      downloadFile(csv, filename, 'text/csv')

      toast({
        title: 'Export successful',
        description: `Downloaded ${data.length} results as ${filename}`,
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
      const json = exportToJSON(data)
      const filename = generateFilename('json')
      downloadFile(json, filename, 'application/json')

      toast({
        title: 'Export successful',
        description: `Downloaded ${data.length} results as ${filename}`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const isDisabled = disabled || data.length === 0

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleExportCSV}
        disabled={isDisabled}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span> CSV
      </Button>
      <Button
        variant="outline"
        onClick={handleExportJSON}
        disabled={isDisabled}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span> JSON
      </Button>
    </div>
  )
}
