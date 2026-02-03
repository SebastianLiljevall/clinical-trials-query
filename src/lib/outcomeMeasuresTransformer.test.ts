import { describe, it, expect } from 'vitest'
import { transformToOutcomeMeasures } from './outcomeMeasuresTransformer'
import type { Study } from './types'

describe('transformToOutcomeMeasures', () => {
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

    const result = transformToOutcomeMeasures([study])
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

    const result = transformToOutcomeMeasures([study])
    expect(result).toEqual([])
  })

  it('returns empty array when outcomeMeasuresModule is missing', () => {
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
      resultsSection: {},
    }

    const result = transformToOutcomeMeasures([study])
    expect(result).toEqual([])
  })

  it('transforms a simple outcome measure with one group', () => {
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
              title: 'Blood Glucose Level',
              timeFrame: '12 weeks',
              unitOfMeasure: 'mg/dL',
              groups: [{ id: 'G1', title: 'Treatment Group' }],
              denoms: [
                {
                  units: 'Participants',
                  counts: [{ groupId: 'G1', value: 100 }],
                },
              ],
              classes: [
                {
                  categories: [
                    {
                      measurements: [
                        { groupId: 'G1', value: '120', spread: '15' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToOutcomeMeasures([study])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      nctId: 'NCT12345678',
      conditions: 'Diabetes',
      outcomeType: 'PRIMARY',
      endpoint: 'Blood Glucose Level',
      timeFrame: '12 weeks',
      unitOfMeasure: 'mg/dL',
      groups: [
        {
          name: 'Treatment Group',
          n: 100,
          estimate: '120',
          se: '15',
        },
      ],
    })
  })

  it('transforms outcome measure with multiple groups', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT87654321' },
        statusModule: { overallStatus: 'Completed' },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Test Sponsor', class: 'OTHER' },
        },
        conditionsModule: { conditions: ['Hypertension', 'Heart Disease'] },
      },
      hasResults: true,
      resultsSection: {
        outcomeMeasuresModule: {
          outcomeMeasures: [
            {
              type: 'SECONDARY',
              title: 'Systolic Blood Pressure',
              timeFrame: '6 months',
              unitOfMeasure: 'mmHg',
              groups: [
                { id: 'G1', title: 'Intervention' },
                { id: 'G2', title: 'Control' },
              ],
              denoms: [
                {
                  units: 'Participants',
                  counts: [
                    { groupId: 'G1', value: 50 },
                    { groupId: 'G2', value: 48 },
                  ],
                },
              ],
              classes: [
                {
                  categories: [
                    {
                      measurements: [
                        { groupId: 'G1', value: '125', spread: '10' },
                        { groupId: 'G2', value: '135', spread: '12' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToOutcomeMeasures([study])
    expect(result).toHaveLength(1)
    expect(result[0].groups).toHaveLength(2)
    expect(result[0].groups[0]).toEqual({
      name: 'Intervention',
      n: 50,
      estimate: '125',
      se: '10',
    })
    expect(result[0].groups[1]).toEqual({
      name: 'Control',
      n: 48,
      estimate: '135',
      se: '12',
    })
  })

  it('handles missing participant counts gracefully', () => {
    const study: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT11111111' },
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
              groups: [{ id: 'G1', title: 'Group 1' }],
              classes: [
                {
                  categories: [
                    {
                      measurements: [{ groupId: 'G1', value: '100' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToOutcomeMeasures([study])
    expect(result[0].groups[0]).toEqual({
      name: 'Group 1',
      n: undefined,
      estimate: '100',
      se: undefined,
    })
  })

  it('handles missing measurements gracefully', () => {
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
              groups: [{ id: 'G1', title: 'Group 1' }],
              denoms: [
                {
                  units: 'Participants',
                  counts: [{ groupId: 'G1', value: 50 }],
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToOutcomeMeasures([study])
    expect(result[0].groups[0]).toEqual({
      name: 'Group 1',
      n: 50,
      estimate: undefined,
      se: undefined,
    })
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
              groups: [{ id: 'G1', title: 'Group 1' }],
              denoms: [
                {
                  units: 'Participants',
                  counts: [{ groupId: 'G1', value: 50 }],
                },
              ],
              classes: [
                {
                  categories: [
                    {
                      measurements: [{ groupId: 'G1', value: '100' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToOutcomeMeasures([study])
    expect(result[0].conditions).toBe('N/A')
  })

  it('processes multiple studies and flattens outcome measures', () => {
    const study1: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT11111111' },
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
              groups: [{ id: 'G1', title: 'Group 1' }],
              denoms: [
                {
                  units: 'Participants',
                  counts: [{ groupId: 'G1', value: 50 }],
                },
              ],
              classes: [
                {
                  categories: [
                    {
                      measurements: [{ groupId: 'G1', value: '100' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const study2: Study = {
      protocolSection: {
        identificationModule: { nctId: 'NCT22222222' },
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
              groups: [{ id: 'G1', title: 'Group 2' }],
              denoms: [
                {
                  units: 'Participants',
                  counts: [{ groupId: 'G1', value: 75 }],
                },
              ],
              classes: [
                {
                  categories: [
                    {
                      measurements: [{ groupId: 'G1', value: '200' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }

    const result = transformToOutcomeMeasures([study1, study2])
    expect(result).toHaveLength(2)
    expect(result[0].nctId).toBe('NCT11111111')
    expect(result[0].endpoint).toBe('Outcome 1')
    expect(result[1].nctId).toBe('NCT22222222')
    expect(result[1].endpoint).toBe('Outcome 2')
  })
})
