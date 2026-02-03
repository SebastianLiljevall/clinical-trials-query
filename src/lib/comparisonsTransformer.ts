import type { Study, TransformedComparison, OutcomeMeasureResult } from './types'

/**
 * Transform studies with published results into comparison rows
 * Each pairwise comparison becomes one row with statistical comparison data
 */
export function transformToComparisons(studies: Study[]): TransformedComparison[] {
  const allComparisons: TransformedComparison[] = []

  for (const study of studies) {
    // Skip studies without results
    if (!study.hasResults) continue
    if (!study.resultsSection) continue
    if (!study.resultsSection.outcomeMeasuresModule) continue

    const { nctId } = study.protocolSection.identificationModule
    const conditions =
      study.protocolSection.conditionsModule?.conditions?.join(', ') ?? 'N/A'

    const outcomeMeasures =
      study.resultsSection.outcomeMeasuresModule.outcomeMeasures

    for (const measure of outcomeMeasures) {
      const comparisons = extractComparisons(nctId, conditions, measure)
      allComparisons.push(...comparisons)
    }
  }

  return allComparisons
}

/**
 * Extract all pairwise comparisons from a single outcome measure
 * Creates one comparison row for each analysis with exactly 2 groups
 */
function extractComparisons(
  nctId: string,
  conditions: string,
  measure: OutcomeMeasureResult
): TransformedComparison[] {
  if (!measure.analyses || measure.analyses.length === 0) return []
  if (!measure.groups) return []

  // Build group name lookup map
  const groupNames = new Map<string, string>()
  for (const group of measure.groups) {
    groupNames.set(group.id, group.title)
  }

  const comparisons: TransformedComparison[] = []

  for (const analysis of measure.analyses) {
    // Skip analyses that don't have exactly 2 groups
    if (!analysis.groupIds || analysis.groupIds.length !== 2) continue

    const group1Id = analysis.groupIds[0]
    const group2Id = analysis.groupIds[1]

    const group1Name = groupNames.get(group1Id)
    const group2Name = groupNames.get(group2Id)

    // Skip if we can't find group names
    if (!group1Name || !group2Name) continue

    comparisons.push({
      nctId,
      conditions,
      outcomeType: measure.type,
      endpoint: measure.title,
      timeFrame: measure.timeFrame,
      group1Name,
      group2Name,
      differenceEstimate:
        analysis.paramValue !== undefined ? String(analysis.paramValue) : undefined,
      differenceSE:
        analysis.dispersionValue !== undefined
          ? String(analysis.dispersionValue)
          : undefined,
      pValue: analysis.pValue,
      statisticalMethod: analysis.statisticalMethod,
      ciLowerLimit: analysis.ciLowerLimit,
      ciUpperLimit: analysis.ciUpperLimit,
      ciPctValue: analysis.ciPctValue,
    })
  }

  return comparisons
}
