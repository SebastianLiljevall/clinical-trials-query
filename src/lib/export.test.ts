import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToJSON, downloadFile, generateFilename } from './export'
import type { TransformedStudy } from './types'

describe('exportToCSV', () => {
  it('converts studies to CSV format', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Test Study',
        sponsor: 'Test University',
        sponsorClass: 'OTHER',
        phase: 'Phase 2',
        status: 'COMPLETED',
        locationCount: 3,
        hasResults: true,
        conditions: 'MSA',
      },
    ]

    const csv = exportToCSV(studies)

    expect(csv).toContain('nctId,title,sponsor')
    expect(csv).toContain('NCT12345678,Test Study,Test University')
  })

  it('escapes commas in fields', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Study with, comma',
        sponsor: 'Test',
        sponsorClass: 'OTHER',
        phase: 'Phase 2, Phase 3',
        status: 'COMPLETED',
        locationCount: 1,
        hasResults: false,
        conditions: 'MSA, Parkinson',
      },
    ]

    const csv = exportToCSV(studies)

    expect(csv).toContain('"Study with, comma"')
    expect(csv).toContain('"Phase 2, Phase 3"')
    expect(csv).toContain('"MSA, Parkinson"')
  })

  it('handles empty array', () => {
    const csv = exportToCSV([])
    expect(csv).toBe('')
  })
})

describe('exportToJSON', () => {
  it('converts studies to JSON string', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Test Study',
        sponsor: 'Test',
        sponsorClass: 'OTHER',
        phase: 'Phase 2',
        status: 'COMPLETED',
        locationCount: 1,
        hasResults: true,
        conditions: 'MSA',
      },
    ]

    const json = exportToJSON(studies)
    const parsed = JSON.parse(json)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].nctId).toBe('NCT12345678')
  })

  it('formats with indentation', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Test',
        sponsor: 'Test',
        sponsorClass: 'OTHER',
        phase: 'Phase 2',
        status: 'COMPLETED',
        locationCount: 1,
        hasResults: true,
        conditions: 'MSA',
      },
    ]

    const json = exportToJSON(studies)

    expect(json).toContain('  "nctId"')
    expect(json).toContain('\n')
  })
})

describe('generateFilename', () => {
  it('generates filename with timestamp', () => {
    const filename = generateFilename('csv')

    expect(filename).toMatch(/^clinical-trials-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/)
  })

  it('uses correct extension for JSON', () => {
    const filename = generateFilename('json')

    expect(filename).toMatch(/\.json$/)
  })
})

describe('downloadFile', () => {
  beforeEach(() => {
    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates download link and triggers click', () => {
    const clickMock = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement')

    downloadFile('test content', 'test.csv', 'text/csv')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
