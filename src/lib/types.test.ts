// src/lib/types.test.ts
import { describe, it, expect } from 'vitest'
import type { OutcomeMeasuresModule, OutcomeMeasureResult } from './types'

describe('ResultsSection types', () => {
  it('should allow OutcomeMeasuresModule with empty array', () => {
    const mockData: OutcomeMeasuresModule = {
      outcomeMeasures: []
    }
    expect(mockData.outcomeMeasures).toEqual([])
  })

  it('should require type and title for OutcomeMeasureResult', () => {
    const mockOutcome: OutcomeMeasureResult = {
      type: 'PRIMARY',
      title: 'Change in CDR-SB Score',
      timeFrame: '12 weeks',
    }
    expect(mockOutcome.type).toBe('PRIMARY')
    expect(mockOutcome.title).toBe('Change in CDR-SB Score')
    expect(mockOutcome.timeFrame).toBe('12 weeks')
  })

  it('should handle complete outcome with all nested structures', () => {
    const fullOutcome: OutcomeMeasureResult = {
      type: 'SECONDARY',
      title: 'Adverse Events',
      description: 'Number of adverse events',
      timeFrame: '24 weeks',
      paramType: 'COUNT_OF_PARTICIPANTS',
      unitOfMeasure: 'Participants',
      groups: [
        { id: 'G1', title: 'Treatment', description: 'Active drug' },
        { id: 'G2', title: 'Placebo' }
      ],
      denoms: [
        {
          units: 'Participants',
          counts: [
            { groupId: 'G1', value: 100 },
            { groupId: 'G2', value: 98 }
          ]
        }
      ],
      classes: [
        {
          title: 'Overall',
          categories: [
            {
              title: 'Category 1',
              measurements: [
                {
                  groupId: 'G1',
                  value: '50',
                  spread: '10',
                  lowerLimit: '40',
                  upperLimit: '60'
                }
              ]
            }
          ]
        }
      ],
      analyses: [
        {
          groupIds: ['G1', 'G2'],
          paramType: 'MEAN_DIFFERENCE',
          paramValue: 5.2,
          pValue: '0.003',
          statisticalMethod: 'ANCOVA'
        }
      ]
    }
    expect(fullOutcome.groups).toHaveLength(2)
    expect(fullOutcome.analyses?.[0].pValue).toBe('0.003')
  })
})
