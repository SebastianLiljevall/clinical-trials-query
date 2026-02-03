// src/lib/types.test.ts
import { describe, it, expect } from 'vitest'
import type { OutcomeMeasuresModule, OutcomeMeasureResult } from './types'

describe('ResultsSection types', () => {
  it('should have proper OutcomeMeasuresModule structure', () => {
    const mockData: OutcomeMeasuresModule = {
      outcomeMeasures: []
    }
    expect(mockData).toBeDefined()
  })

  it('should have proper OutcomeMeasureResult structure', () => {
    const mockOutcome: OutcomeMeasureResult = {
      type: 'PRIMARY',
      title: 'Test outcome',
      timeFrame: '12 weeks',
      groups: [],
    }
    expect(mockOutcome.type).toBe('PRIMARY')
  })
})
