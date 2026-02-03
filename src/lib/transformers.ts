import type { Study, TransformedStudy } from './types'

export function transformStudy(study: Study): TransformedStudy {
  const { protocolSection, hasResults } = study

  // Extract basic info
  const nctId = protocolSection.identificationModule.nctId
  const title = protocolSection.identificationModule.officialTitle ||
                protocolSection.identificationModule.briefTitle ||
                'N/A'

  // Extract sponsor info
  const sponsor = protocolSection.sponsorCollaboratorsModule.leadSponsor.name
  const sponsorClass = protocolSection.sponsorCollaboratorsModule.leadSponsor.class

  // Extract phase
  const phases = protocolSection.designModule?.phases || []
  const phase = phases.length > 0
    ? phases.map(p => formatPhase(p)).join(', ')
    : 'N/A'

  // Extract status
  const status = protocolSection.statusModule.overallStatus

  // Count locations
  const locationCount = protocolSection.contactsLocationsModule?.locations?.length || 0

  // Extract conditions
  const conditions = protocolSection.conditionsModule?.conditions?.join(', ') || 'N/A'

  // Extract dates
  const startDate = protocolSection.statusModule.startDateStruct?.date
  const completionDate = protocolSection.statusModule.completionDateStruct?.date

  // Extract enrollment
  const enrollmentCount = protocolSection.designModule?.enrollmentInfo?.count

  // Extract primary outcomes
  const primaryOutcomes = protocolSection.outcomesModule?.primaryOutcomes
    ?.map(o => o.measure)
    .join('; ')

  return {
    nctId,
    title,
    sponsor,
    sponsorClass,
    phase,
    status,
    locationCount,
    hasResults,
    conditions,
    startDate,
    completionDate,
    enrollmentCount,
    primaryOutcomes,
    interventions: undefined, // TODO: extract interventions if needed
  }
}

function formatPhase(phase: string): string {
  // Convert "PHASE2" to "Phase 2"
  const match = phase.match(/PHASE(\d+)/)
  if (match) {
    return `Phase ${match[1]}`
  }

  // Handle special cases
  if (phase === 'EARLY_PHASE1') return 'Early Phase 1'
  if (phase === 'NA') return 'N/A'

  return phase
}

export function transformStudies(studies: Study[]): TransformedStudy[] {
  return studies.map(transformStudy)
}

export function filterByDescription(studies: Study[], searchTerm: string): Study[] {
  if (!searchTerm) return studies

  const lowerSearch = searchTerm.toLowerCase()

  return studies.filter(study => {
    const { protocolSection } = study

    // Search in description
    const description = protocolSection.descriptionModule?.briefSummary || ''
    const detailedDescription = protocolSection.descriptionModule?.detailedDescription || ''

    if (description.toLowerCase().includes(lowerSearch) ||
        detailedDescription.toLowerCase().includes(lowerSearch)) {
      return true
    }

    // Search in outcome measures
    const outcomes = [
      ...(protocolSection.outcomesModule?.primaryOutcomes || []),
      ...(protocolSection.outcomesModule?.secondaryOutcomes || []),
    ]

    return outcomes.some(outcome =>
      outcome.measure.toLowerCase().includes(lowerSearch) ||
      outcome.description?.toLowerCase().includes(lowerSearch)
    )
  })
}

export function filterByPhases(studies: Study[], selectedPhases: string[]): Study[] {
  if (selectedPhases.length === 0) return studies

  return studies.filter(study => {
    const phases = study.protocolSection.designModule?.phases || []
    return phases.some(phase => selectedPhases.includes(phase))
  })
}

export function filterByHasResults(studies: Study[], requireResults: boolean): Study[] {
  if (!requireResults) return studies
  return studies.filter(study => study.hasResults === true)
}

export function applyFilters(
  studies: Study[],
  params: {
    descriptionSearch?: string
    phases?: string[]
    hasResults?: boolean
  }
): Study[] {
  let filtered = studies

  if (params.descriptionSearch) {
    filtered = filterByDescription(filtered, params.descriptionSearch)
  }

  if (params.phases && params.phases.length > 0) {
    filtered = filterByPhases(filtered, params.phases)
  }

  if (params.hasResults) {
    filtered = filterByHasResults(filtered, params.hasResults)
  }

  return filtered
}
