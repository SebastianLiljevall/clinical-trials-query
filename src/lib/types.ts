// ClinicalTrials.gov API v2 Response Types

export interface StudyResponse {
  studies: Study[]
  nextPageToken?: string
  totalCount?: number
}

export interface Study {
  protocolSection: ProtocolSection
  hasResults: boolean
  derivedSection?: DerivedSection
  resultsSection?: ResultsSection
}

export interface ProtocolSection {
  identificationModule: IdentificationModule
  statusModule: StatusModule
  sponsorCollaboratorsModule: SponsorCollaboratorsModule
  descriptionModule?: DescriptionModule
  conditionsModule?: ConditionsModule
  designModule?: DesignModule
  outcomesModule?: OutcomesModule
  eligibilityModule?: EligibilityModule
  contactsLocationsModule?: ContactsLocationsModule
}

export interface IdentificationModule {
  nctId: string
  orgStudyIdInfo?: {
    id: string
  }
  organization?: {
    fullName: string
    class: string
  }
  briefTitle?: string
  officialTitle?: string
}

export interface StatusModule {
  statusVerifiedDate?: string
  overallStatus: string
  expandedAccessInfo?: {
    hasExpandedAccess: boolean
  }
  startDateStruct?: {
    date: string
    type: string
  }
  primaryCompletionDateStruct?: {
    date: string
    type: string
  }
  completionDateStruct?: {
    date: string
    type: string
  }
  studyFirstSubmitDate?: string
  studyFirstPostDateStruct?: {
    date: string
    type: string
  }
  lastUpdateSubmitDate?: string
  lastUpdatePostDateStruct?: {
    date: string
    type: string
  }
}

export interface SponsorCollaboratorsModule {
  leadSponsor: {
    name: string
    class: string
  }
  collaborators?: Array<{
    name: string
    class: string
  }>
}

export interface DescriptionModule {
  briefSummary?: string
  detailedDescription?: string
}

export interface ConditionsModule {
  conditions: string[]
  keywords?: string[]
}

export interface DesignModule {
  studyType: string
  phases?: string[]
  designInfo?: {
    allocation?: string
    interventionModel?: string
    primaryPurpose?: string
    maskingInfo?: {
      masking?: string
    }
  }
  enrollmentInfo?: {
    count: number
    type: string
  }
}

export interface OutcomesModule {
  primaryOutcomes?: OutcomeMeasure[]
  secondaryOutcomes?: OutcomeMeasure[]
}

export interface OutcomeMeasure {
  measure: string
  description?: string
  timeFrame?: string
}

export interface EligibilityModule {
  eligibilityCriteria?: string
  healthyVolunteers?: boolean
  sex?: string
  minimumAge?: string
  maximumAge?: string
  stdAges?: string[]
}

export interface ContactsLocationsModule {
  locations?: Location[]
  centralContacts?: Contact[]
  overallOfficials?: Contact[]
}

export interface Location {
  facility?: string
  status?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  geoPoint?: {
    lat: number
    lon: number
  }
}

export interface Contact {
  name?: string
  role?: string
  phone?: string
  email?: string
}

export interface DerivedSection {
  miscInfoModule?: {
    versionHolder?: string
  }
  conditionBrowseModule?: {
    meshes?: Array<{
      id: string
      term: string
    }>
    ancestors?: Array<{
      id: string
      term: string
    }>
    browseLeaves?: Array<{
      id: string
      name: string
      relevance: string
    }>
    browseBranches?: Array<{
      abbrev: string
      name: string
    }>
  }
}

export interface ResultsSection {
  participantFlowModule?: ParticipantFlowModule
  baselineCharacteristicsModule?: BaselineCharacteristicsModule
  outcomeMeasuresModule?: OutcomeMeasuresModule
  adverseEventsModule?: AdverseEventsModule
}

export interface ParticipantFlowModule {
  // Keep as any for now - not needed for this feature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface BaselineCharacteristicsModule {
  // Keep as any for now - not needed for this feature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface AdverseEventsModule {
  // Keep as any for now - not needed for this feature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface OutcomeMeasuresModule {
  outcomeMeasures: OutcomeMeasureResult[]
}

export interface OutcomeMeasureResult {
  type: 'PRIMARY' | 'SECONDARY'
  title: string
  description?: string
  timeFrame: string
  paramType?: string
  dispersionType?: string
  unitOfMeasure?: string

  groups?: Array<{
    id: string
    title: string
    description?: string
  }>

  denoms?: Array<{
    units: string
    counts: Array<{
      groupId: string
      value: number
    }>
  }>

  classes?: Array<{
    title?: string
    categories?: Array<{
      title?: string
      measurements: Array<{
        groupId: string
        value: string
        spread?: string
        lowerLimit?: string
        upperLimit?: string
        comment?: string
      }>
    }>
  }>

  analyses?: Array<{
    groupIds: string[]
    paramType?: string
    paramValue?: number
    dispersionType?: string
    dispersionValue?: number
    pValue?: string
    pValueComment?: string
    statisticalMethod?: string
    ciNumSides?: string
    ciPctValue?: string
    ciLowerLimit?: string
    ciUpperLimit?: string
  }>
}

// Transformed data for display in table
export interface TransformedStudy {
  nctId: string
  title: string
  sponsor: string
  sponsorClass: string
  phase: string
  status: string
  locationCount: number
  hasResults: boolean
  conditions: string
  startDate?: string
  completionDate?: string
  enrollmentCount?: number
  primaryOutcomes?: string
  interventions?: string
}

export interface GroupMeasurement {
  name: string
  n?: number
  estimate?: string
  se?: string
}

export interface TransformedOutcomeMeasure {
  nctId: string
  conditions: string
  outcomeType: string
  endpoint: string
  timeFrame: string
  unitOfMeasure?: string
  groups: GroupMeasurement[]
}

export interface TransformedComparison {
  nctId: string
  conditions: string
  outcomeType: string
  endpoint: string
  timeFrame: string
  group1Name: string
  group2Name: string
  differenceEstimate?: string
  differenceSE?: string
  pValue?: string
  statisticalMethod?: string
  ciLowerLimit?: string
  ciUpperLimit?: string
  ciPctValue?: string
}

// Query parameters
export interface QueryParams {
  condition?: string
  descriptionSearch?: string
  status?: string
  hasResults?: boolean
  phases?: string[]
  resultLimit: number
}

// UI state
export interface QueryState {
  isLoading: boolean
  error: string | null
  results: Study[]
  filteredResults: TransformedStudy[]
  queryParams: QueryParams
}

export type ExportFormat = 'csv' | 'json'

export type TableView = 'studies' | 'outcomes' | 'comparisons'

export interface ColumnConfig {
  key: keyof TransformedStudy
  label: string
  visible: boolean
  sortable: boolean
}
