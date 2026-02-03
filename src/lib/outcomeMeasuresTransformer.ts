import type {
  Study,
  TransformedOutcomeMeasure,
  GroupMeasurement,
  OutcomeMeasureResult,
} from './types'

/**
 * Transform studies with published results into outcome measure rows
 * Each outcome measure becomes one row with measurements from all groups
 */
export function transformToOutcomeMeasures(
  studies: Study[]
): TransformedOutcomeMeasure[] {
  const allMeasures: TransformedOutcomeMeasure[] = []

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
      allMeasures.push(transformSingleOutcomeMeasure(nctId, conditions, measure))
    }
  }

  return allMeasures
}

/**
 * Transform a single outcome measure into a row with all group measurements
 */
function transformSingleOutcomeMeasure(
  nctId: string,
  conditions: string,
  measure: OutcomeMeasureResult
): TransformedOutcomeMeasure {
  const groups = extractGroupMeasurements(measure)

  return {
    nctId,
    conditions,
    outcomeType: measure.type,
    endpoint: measure.title,
    timeFrame: measure.timeFrame,
    unitOfMeasure: measure.unitOfMeasure,
    groups,
  }
}

/**
 * Extract measurements for all groups from the nested structure
 * Combines group names, participant counts, estimates, and standard errors
 */
export function extractGroupMeasurements(
  measure: OutcomeMeasureResult
): GroupMeasurement[] {
  if (!measure.groups) return []

  // Build maps for efficient lookup
  const participantCounts = extractParticipantCounts(measure)
  const measurements = extractMeasurements(measure)

  // Create group measurements by combining all data
  return measure.groups.map((group) => ({
    name: group.title,
    n: participantCounts.get(group.id),
    estimate: measurements.get(group.id)?.estimate,
    se: measurements.get(group.id)?.se,
  }))
}

/**
 * Extract participant counts (n) for each group from denoms
 */
function extractParticipantCounts(
  measure: OutcomeMeasureResult
): Map<string, number> {
  const counts = new Map<string, number>()

  if (!measure.denoms || measure.denoms.length === 0) return counts

  // Use first denom unit (typically "Participants")
  const denom = measure.denoms[0]
  if (!denom.counts) return counts

  for (const count of denom.counts) {
    counts.set(count.groupId, count.value)
  }

  return counts
}

/**
 * Extract measurements (estimate and se) for each group from classes
 */
function extractMeasurements(measure: OutcomeMeasureResult): Map<
  string,
  { estimate?: string; se?: string }
> {
  const measurements = new Map<string, { estimate?: string; se?: string }>()

  if (!measure.classes || measure.classes.length === 0) return measurements

  // Use first class, first category
  const firstClass = measure.classes[0]
  if (!firstClass.categories || firstClass.categories.length === 0)
    return measurements

  const firstCategory = firstClass.categories[0]
  if (!firstCategory.measurements) return measurements

  for (const m of firstCategory.measurements) {
    measurements.set(m.groupId, {
      estimate: m.value,
      se: m.spread,
    })
  }

  return measurements
}
