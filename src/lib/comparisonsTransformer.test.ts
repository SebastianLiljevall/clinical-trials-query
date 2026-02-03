import { describe, it, expect } from 'vitest'
import { transformToComparisons } from './comparisonsTransformer'
import type { Study } from './types'

describe('transformToComparisons', () => {
  it('returns empty array when study has no results', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT12345678' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Test Condition'] },
      },
      hasResults: false,
    }

    const result = transformToComparisons([study])
    expect(result).toEqual([])
  })

  it('returns empty array when resultsSection is missing', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT12345678' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Test Condition'] },
      },
      hasResults: true,
    }

    const result = transformToComparisons([study])
    expect(result).toEqual([])
  })

  it('returns empty array when outcome has no analyses', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT12345678' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Test Condition'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'PRIMARY',
              title: 'Test Outcome',
              timeFrame: '12 weeks',
              groups: [
                { id: 'G1', title: 'Treatment' },
                { id: 'G2', title: 'Placebo' },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study])
    expect(result).toEqual([])
  })

  it('transforms a simple pairwise comparison with all fields', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT12345678' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Diabetes'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'PRIMARY',
              title: 'HbA1c Change',
              timeFrame: '12 weeks',
              groups: [
                { id: 'G1', title: 'Treatment' },
                { id: 'G2', title: 'Placebo' },
              ],
              analyses: [
                {
                  groupIds: ['G1', 'G2'],
                  paramType: 'Mean Difference',
                  paramValue: -0.8,
                  dispersionType: 'Standard Error',
                  dispersionValue: 0.15,
                  pValue: '0.001',
                  statisticalMethod: 'ANCOVA',
                  ciPctValue: '95',
                  ciLowerLimit: '-1.1',
                  ciUpperLimit: '-0.5',
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      nctId: 'NCT12345678',
      conditions: 'Diabetes',
      outcomeType: 'PRIMARY',
      endpoint: 'HbA1c Change',
      timeFrame: '12 weeks',
      group1Name: 'Treatment',
      group2Name: 'Placebo',
      differenceEstimate: '-0.8',
      differenceSE: '0.15',
      pValue: '0.001',
      statisticalMethod: 'ANCOVA',
      ciLowerLimit: '-1.1',
      ciUpperLimit: '-0.5',
      ciPctValue: '95',
    })
  })

  it('handles missing optional statistical fields', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT99999999' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Hypertension'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'SECONDARY',
              title: 'Blood Pressure',
              timeFrame: '6 months',
              groups: [
                { id: 'G1', title: 'Drug A' },
                { id: 'G2', title: 'Drug B' },
              ],
              analyses: [
                {
                  groupIds: ['G1', 'G2'],
                  pValue: '0.05',
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      nctId: 'NCT99999999',
      conditions: 'Hypertension',
      outcomeType: 'SECONDARY',
      endpoint: 'Blood Pressure',
      timeFrame: '6 months',
      group1Name: 'Drug A',
      group2Name: 'Drug B',
      differenceEstimate: undefined,
      differenceSE: undefined,
      pValue: '0.05',
      statisticalMethod: undefined,
      ciLowerLimit: undefined,
      ciUpperLimit: undefined,
      ciPctValue: undefined,
    })
  })

  it('handles 3-arm study with multiple pairwise comparisons', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT11111111' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Depression'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'PRIMARY',
              title: 'HAM-D Score',
              timeFrame: '8 weeks',
              groups: [
                { id: 'G1', title: 'Drug A' },
                { id: 'G2', title: 'Drug B' },
                { id: 'G3', title: 'Placebo' },
              ],
              analyses: [
                {
                  groupIds: ['G1', 'G3'],
                  paramValue: -5.2,
                  dispersionValue: 1.1,
                  pValue: '0.001',
                },
                {
                  groupIds: ['G2', 'G3'],
                  paramValue: -3.8,
                  dispersionValue: 1.2,
                  pValue: '0.01',
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study])
    expect(result).toHaveLength(2)

    expect(result[0]).toEqual({
      nctId: 'NCT11111111',
      conditions: 'Depression',
      outcomeType: 'PRIMARY',
      endpoint: 'HAM-D Score',
      timeFrame: '8 weeks',
      group1Name: 'Drug A',
      group2Name: 'Placebo',
      differenceEstimate: '-5.2',
      differenceSE: '1.1',
      pValue: '0.001',
      statisticalMethod: undefined,
      ciLowerLimit: undefined,
      ciUpperLimit: undefined,
      ciPctValue: undefined,
    })

    expect(result[1]).toEqual({
      nctId: 'NCT11111111',
      conditions: 'Depression',
      outcomeType: 'PRIMARY',
      endpoint: 'HAM-D Score',
      timeFrame: '8 weeks',
      group1Name: 'Drug B',
      group2Name: 'Placebo',
      differenceEstimate: '-3.8',
      differenceSE: '1.2',
      pValue: '0.01',
      statisticalMethod: undefined,
      ciLowerLimit: undefined,
      ciUpperLimit: undefined,
      ciPctValue: undefined,
    })
  })

  it('skips analyses without exactly 2 group IDs', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT22222222' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Test'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'PRIMARY',
              title: 'Test Outcome',
              timeFrame: '1 week',
              groups: [
                { id: 'G1', title: 'Group 1' },
                { id: 'G2', title: 'Group 2' },
                { id: 'G3', title: 'Group 3' },
              ],
              analyses: [
                {
                  groupIds: ['G1'],
                  pValue: '0.05',
                },
                {
                  groupIds: ['G1', 'G2', 'G3'],
                  pValue: '0.01',
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study])
    expect(result).toEqual([])
  })

  it('handles missing conditionsModule gracefully', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT33333333' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'PRIMARY',
              title: 'Test Outcome',
              timeFrame: '1 week',
              groups: [
                { id: 'G1', title: 'Treatment' },
                { id: 'G2', title: 'Control' },
              ],
              analyses: [
                {
                  groupIds: ['G1', 'G2'],
                  pValue: '0.05',
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study])
    expect(result[0].conditions).toBe('N/A')
  })

  it('processes multiple studies and outcomes', () => {
    const study1: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT44444444' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Condition A'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'PRIMARY',
              title: 'Outcome 1',
              timeFrame: '1 week',
              groups: [
                { id: 'G1', title: 'Group A' },
                { id: 'G2', title: 'Group B' },
              ],
              analyses: [
                {
                  groupIds: ['G1', 'G2'],
                  pValue: '0.01',
                },
              ],
            },
          ],
        },
      },
    }

    const study2: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT55555555' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Condition B'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'SECONDARY',
              title: 'Outcome 2',
              timeFrame: '2 weeks',
              groups: [
                { id: 'G1', title: 'Group C' },
                { id: 'G2', title: 'Group D' },
              ],
              analyses: [
                {
                  groupIds: ['G1', 'G2'],
                  pValue: '0.05',
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToComparisons([study1, study2])
    expect(result).toHaveLength(2)
    expect(result[0].nctId).toBe('NCT44444444')
    expect(result[0].endpoint).toBe('Outcome 1')
    expect(result[1].nctId).toBe('NCT55555555')
    expect(result[1].endpoint).toBe('Outcome 2')
  })
})
