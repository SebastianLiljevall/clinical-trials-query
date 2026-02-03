import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  exportToCSV,
  exportToJSON,
  downloadFile,
  generateFilename,
  generateOutcomeMeasuresCSV,
  generateComparisonsCSV,
  exportStudiesCSV,
  exportOutcomeMeasuresCSV,
  exportComparisonsCSV,
} from './export'
import type { TransformedStudy, TransformedOutcomeMeasure, TransformedComparison } from './types'

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
    const createElementSpy = vi.spyOn(document, 'createElement')

    downloadFile('test content', 'test.csv', 'text/csv')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})

describe('generateOutcomeMeasuresCSV', () => {
  it('generates CSV with dynamic columns based on max number of groups', () => {
    const outcomes: TransformedOutcomeMeasure[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA',
        outcomeType: 'PRIMARY',
        endpoint: 'Change in UMSARS',
        timeFrame: '12 weeks',
        unitOfMeasure: 'points',
        groups: [
          { name: 'Treatment', n: 50, estimate: '-5.2', se: '1.1' },
          { name: 'Placebo', n: 48, estimate: '-1.3', se: '1.0' },
        ],
      },
      {
        nctId: 'NCT00000002',
        conditions: 'Parkinson',
        outcomeType: 'SECONDARY',
        endpoint: 'Quality of Life',
        timeFrame: '24 weeks',
        unitOfMeasure: 'score',
        groups: [
          { name: 'Drug A', n: 30, estimate: '15.5', se: '2.0' },
          { name: 'Drug B', n: 32, estimate: '12.3', se: '1.8' },
          { name: 'Control', n: 31, estimate: '8.1', se: '1.5' },
        ],
      },
    ]

    const csv = generateOutcomeMeasuresCSV(outcomes)

    // Check headers - should have 3 groups based on max
    expect(csv).toContain('NCT ID,Conditions,Outcome Type,Endpoint,Time Frame,Unit of Measure')
    expect(csv).toContain('Group 1 Name,Group 1 N,Group 1 Estimate,Group 1 SE')
    expect(csv).toContain('Group 2 Name,Group 2 N,Group 2 Estimate,Group 2 SE')
    expect(csv).toContain('Group 3 Name,Group 3 N,Group 3 Estimate,Group 3 SE')

    // Check first row (2 groups)
    expect(csv).toContain(
      'NCT00000001,MSA,PRIMARY,Change in UMSARS,12 weeks,points,Treatment,50,-5.2,1.1,Placebo,48,-1.3,1.0'
    )

    // Check second row (3 groups)
    expect(csv).toContain(
      'NCT00000002,Parkinson,SECONDARY,Quality of Life,24 weeks,score,Drug A,30,15.5,2.0,Drug B,32,12.3,1.8,Control,31,8.1,1.5'
    )
  })

  it('handles outcome measures with fields containing commas', () => {
    const outcomes: TransformedOutcomeMeasure[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA, Parkinson',
        outcomeType: 'PRIMARY',
        endpoint: 'Change in UMSARS, baseline to week 12',
        timeFrame: '12 weeks',
        groups: [{ name: 'Treatment A, B', n: 50, estimate: '-5.2' }],
      },
    ]

    const csv = generateOutcomeMeasuresCSV(outcomes)

    expect(csv).toContain('"MSA, Parkinson"')
    expect(csv).toContain('"Change in UMSARS, baseline to week 12"')
    expect(csv).toContain('"Treatment A, B"')
  })

  it('handles empty array', () => {
    const csv = generateOutcomeMeasuresCSV([])
    expect(csv).toBe('')
  })

  it('handles missing optional fields', () => {
    const outcomes: TransformedOutcomeMeasure[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA',
        outcomeType: 'PRIMARY',
        endpoint: 'Test',
        timeFrame: '12 weeks',
        groups: [{ name: 'Group A' }],
      },
    ]

    const csv = generateOutcomeMeasuresCSV(outcomes)

    expect(csv).toContain('NCT00000001,MSA,PRIMARY,Test,12 weeks')
    expect(csv).toContain('Group A,,,')
  })
})

describe('generateComparisonsCSV', () => {
  it('generates CSV with fixed columns', () => {
    const comparisons: TransformedComparison[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA',
        outcomeType: 'PRIMARY',
        endpoint: 'Change in UMSARS',
        timeFrame: '12 weeks',
        group1Name: 'Treatment',
        group2Name: 'Placebo',
        differenceEstimate: '-3.9',
        differenceSE: '1.5',
        pValue: '0.009',
        statisticalMethod: 'ANCOVA',
        ciLowerLimit: '-6.8',
        ciUpperLimit: '-1.0',
        ciPctValue: '95',
      },
    ]

    const csv = generateComparisonsCSV(comparisons)

    // Check headers
    expect(csv).toContain(
      'NCT ID,Conditions,Outcome Type,Endpoint,Time Frame,Group 1,Group 2,Difference Estimate,Difference SE,P Value,Statistical Method,CI Lower,CI Upper,CI %'
    )

    // Check data row
    expect(csv).toContain(
      'NCT00000001,MSA,PRIMARY,Change in UMSARS,12 weeks,Treatment,Placebo,-3.9,1.5,0.009,ANCOVA,-6.8,-1.0,95'
    )
  })

  it('handles comparisons with fields containing commas', () => {
    const comparisons: TransformedComparison[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA, Parkinson',
        outcomeType: 'PRIMARY',
        endpoint: 'Change in scale, week 12',
        timeFrame: '12 weeks',
        group1Name: 'Treatment A, B',
        group2Name: 'Placebo',
        pValue: '<0.001',
      },
    ]

    const csv = generateComparisonsCSV(comparisons)

    expect(csv).toContain('"MSA, Parkinson"')
    expect(csv).toContain('"Change in scale, week 12"')
    expect(csv).toContain('"Treatment A, B"')
  })

  it('handles empty array', () => {
    const csv = generateComparisonsCSV([])
    expect(csv).toBe('')
  })

  it('handles missing optional fields', () => {
    const comparisons: TransformedComparison[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA',
        outcomeType: 'PRIMARY',
        endpoint: 'Test',
        timeFrame: '12 weeks',
        group1Name: 'Group A',
        group2Name: 'Group B',
      },
    ]

    const csv = generateComparisonsCSV(comparisons)

    expect(csv).toContain('NCT00000001,MSA,PRIMARY,Test,12 weeks,Group A,Group B')
    // Should have empty values for optional fields
    expect(csv).toMatch(/Group B,+,+,+,+,+,+,*$/)
  })
})

describe('exportStudiesCSV', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports studies with correct filename pattern', () => {
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

    const createElementSpy = vi.spyOn(document, 'createElement')
    const clickSpy = vi.fn()

    createElementSpy.mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    exportStudiesCSV(studies)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(clickSpy).toHaveBeenCalled()

    const linkElement = createElementSpy.mock.results[0].value as HTMLAnchorElement
    expect(linkElement.download).toMatch(/^clinical-trials-studies-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/)
  })
})

describe('exportOutcomeMeasuresCSV', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports outcome measures with correct filename pattern', () => {
    const outcomes: TransformedOutcomeMeasure[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA',
        outcomeType: 'PRIMARY',
        endpoint: 'Test',
        timeFrame: '12 weeks',
        groups: [{ name: 'Group A' }],
      },
    ]

    const createElementSpy = vi.spyOn(document, 'createElement')
    const clickSpy = vi.fn()

    createElementSpy.mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    exportOutcomeMeasuresCSV(outcomes)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(clickSpy).toHaveBeenCalled()

    const linkElement = createElementSpy.mock.results[0].value as HTMLAnchorElement
    expect(linkElement.download).toMatch(/^clinical-trials-outcomes-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/)
  })
})

describe('exportComparisonsCSV', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports comparisons with correct filename pattern', () => {
    const comparisons: TransformedComparison[] = [
      {
        nctId: 'NCT00000001',
        conditions: 'MSA',
        outcomeType: 'PRIMARY',
        endpoint: 'Test',
        timeFrame: '12 weeks',
        group1Name: 'Group A',
        group2Name: 'Group B',
      },
    ]

    const createElementSpy = vi.spyOn(document, 'createElement')
    const clickSpy = vi.fn()

    createElementSpy.mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    exportComparisonsCSV(comparisons)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(clickSpy).toHaveBeenCalled()

    const linkElement = createElementSpy.mock.results[0].value as HTMLAnchorElement
    expect(linkElement.download).toMatch(
      /^clinical-trials-comparisons-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/
    )
  })
})
