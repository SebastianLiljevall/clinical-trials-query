import { describe, it, expect } from 'vitest'
import {
  transformStudy,
  filterByDescription,
  filterByPhases,
  filterByHasResults,
} from './transformers'
import type { Study } from './types'

describe('transformStudy', () => {
  it('transforms study to display format', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: {
          nctId: 'NCT12345678',
          officialTitle: 'Test Study Title',
        },
        statusModule: {
          overallStatus: 'COMPLETED',
        },
        sponsorCollaboratorsModule: {
          leadSponsor: {
            name: 'Test University',
            class: 'OTHER',
          },
        },
        designModule: {
          studyType: 'INTERVENTIONAL',
          phases: ['PHASE2', 'PHASE3'],
        },
        contactsLocationsModule: {
          locations: [{}, {}, {}],
        },
        conditionsModule: {
          conditions: ['MSA', 'Parkinson Disease'],
        },
      },
      hasResults: true,
    }

    const transformed = transformStudy(study)

    expect(transformed).toEqual({
      nctId: 'NCT12345678',
      title: 'Test Study Title',
      sponsor: 'Test University',
      sponsorClass: 'OTHER',
      phase: 'Phase 2, Phase 3',
      status: 'COMPLETED',
      locationCount: 3,
      hasResults: true,
      conditions: 'MSA, Parkinson Disease',
      startDate: undefined,
      completionDate: undefined,
      enrollmentCount: undefined,
      primaryOutcomes: undefined,
      interventions: undefined,
    })
  })

  it('handles missing optional fields', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: {
          nctId: 'NCT99999999',
        },
        statusModule: {
          overallStatus: 'RECRUITING',
        },
        sponsorCollaboratorsModule: {
          leadSponsor: {
            name: 'Unknown',
            class: 'OTHER',
          },
        },
      },
      hasResults: false,
    }

    const transformed = transformStudy(study)

    expect(transformed.nctId).toBe('NCT99999999')
    expect(transformed.title).toBe('N/A')
    expect(transformed.phase).toBe('N/A')
    expect(transformed.locationCount).toBe(0)
    expect(transformed.conditions).toBe('N/A')
  })
})

describe('transformStudy with conditions', () => {
  it('should extract conditions as comma-separated string', () => {
    const mockStudy: Study = {
      protocolSection: {
        identificationModule: {
          nctId: 'NCT12345',
          briefTitle: 'Test Study',
        },
        statusModule: {
          overallStatus: 'Completed',
        },
        sponsorCollaboratorsModule: {
          leadSponsor: {
            name: 'Test Sponsor',
            class: 'OTHER',
          },
        },
        conditionsModule: {
          conditions: ['Multiple System Atrophy', 'Parkinson Disease'],
        },
      },
      hasResults: false,
    } as Study

    const result = transformStudy(mockStudy)

    expect(result.conditions).toBe('Multiple System Atrophy, Parkinson Disease')
  })

  it('should handle missing conditions', () => {
    const mockStudy: Study = {
      protocolSection: {
        identificationModule: {
          nctId: 'NCT12345',
          briefTitle: 'Test Study',
        },
        statusModule: {
          overallStatus: 'Completed',
        },
        sponsorCollaboratorsModule: {
          leadSponsor: {
            name: 'Test Sponsor',
            class: 'OTHER',
          },
        },
      },
      hasResults: false,
    } as Study

    const result = transformStudy(mockStudy)

    expect(result.conditions).toBe('N/A')
  })
})

describe('filterByDescription', () => {
  it('filters studies by description text', () => {
    const studies: Study[] = [
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT1' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'A', class: 'OTHER' } },
          descriptionModule: { briefSummary: 'This study uses CDR-SB assessment' },
        },
        hasResults: false,
      },
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT2' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'B', class: 'OTHER' } },
          descriptionModule: { briefSummary: 'This is a different study' },
        },
        hasResults: false,
      },
    ]

    const filtered = filterByDescription(studies, 'CDR-SB')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].protocolSection.identificationModule.nctId).toBe('NCT1')
  })

  it('searches in outcome measures', () => {
    const studies: Study[] = [
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT1' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'A', class: 'OTHER' } },
          outcomesModule: {
            primaryOutcomes: [{ measure: 'CDR-SB score change' }],
          },
        },
        hasResults: false,
      },
    ]

    const filtered = filterByDescription(studies, 'CDR-SB')

    expect(filtered).toHaveLength(1)
  })

  it('is case insensitive', () => {
    const studies: Study[] = [
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT1' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'A', class: 'OTHER' } },
          descriptionModule: { briefSummary: 'Uses cdr-sb' },
        },
        hasResults: false,
      },
    ]

    const filtered = filterByDescription(studies, 'CDR-SB')

    expect(filtered).toHaveLength(1)
  })
})

describe('filterByPhases', () => {
  it('filters studies by selected phases', () => {
    const studies: Study[] = [
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT1' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'A', class: 'OTHER' } },
          designModule: { studyType: 'INTERVENTIONAL', phases: ['PHASE2'] },
        },
        hasResults: false,
      },
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT2' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'B', class: 'OTHER' } },
          designModule: { studyType: 'INTERVENTIONAL', phases: ['PHASE3'] },
        },
        hasResults: false,
      },
    ]

    const filtered = filterByPhases(studies, ['PHASE2'])

    expect(filtered).toHaveLength(1)
    expect(filtered[0].protocolSection.identificationModule.nctId).toBe('NCT1')
  })
})

describe('filterByHasResults', () => {
  it('filters studies with results', () => {
    const studies: Study[] = [
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT1' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'A', class: 'OTHER' } },
        },
        hasResults: true,
      },
      {
        protocolSection: {
          identificationModule: { nctId: 'NCT2' },
          statusModule: { overallStatus: 'COMPLETED' },
          sponsorCollaboratorsModule: { leadSponsor: { name: 'B', class: 'OTHER' } },
        },
        hasResults: false,
      },
    ]

    const filtered = filterByHasResults(studies, true)

    expect(filtered).toHaveLength(1)
    expect(filtered[0].hasResults).toBe(true)
  })
})
