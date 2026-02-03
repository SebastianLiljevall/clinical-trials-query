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
  // Results structure (when available)
  participantFlowModule?: any
  baselineCharacteristicsModule?: any
  outcomeMeasuresModule?: any
  adverseEventsModule?: any
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

export interface ColumnConfig {
  key: keyof TransformedStudy
  label: string
  visible: boolean
  sortable: boolean
}
