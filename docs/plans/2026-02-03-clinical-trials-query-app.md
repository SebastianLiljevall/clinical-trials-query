# Clinical Trials Query Application Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React-based web application for querying ClinicalTrials.gov API and exporting results to CSV/JSON.

**Architecture:** Pure static React + TypeScript app using ClinicalTrials.gov API v2. Client-side filtering for complex queries, shadcn/ui for components, hash routing for GitHub Pages compatibility.

**Tech Stack:** React 18, TypeScript, Vite, shadcn/ui, TanStack Table, React Router, Vitest

---

## Task 1: Project Initialization

**Files:**
- Create: `clinical-trials-query/` (new directory)
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `.gitignore`

**Step 1: Create project directory and initialize**

```bash
mkdir clinical-trials-query
cd clinical-trials-query
npm create vite@latest . -- --template react-ts
```

Expected: Vite creates React TypeScript template

**Step 2: Install base dependencies**

```bash
npm install
npm install react-router-dom
npm install @tanstack/react-table
npm install date-fns
```

**Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 4: Configure Vite for GitHub Pages**

Edit `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/clinical-trials-query/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

**Step 5: Update tsconfig.json for path aliases**

Add to `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 6: Create .gitignore**

```
node_modules
dist
.env
.DS_Store
*.local
coverage
```

**Step 7: Initialize git and commit**

```bash
git init
git branch -m main
git add .
git commit -m "chore: initialize React + TypeScript project with Vite

```

---

## Task 2: Setup Tailwind CSS and shadcn/ui

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Create: `components.json`

**Step 1: Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 2: Configure Tailwind**

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Step 3: Install shadcn/ui dependencies**

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D tailwindcss-animate
```

**Step 4: Setup shadcn/ui**

```bash
npx shadcn@latest init
```

Choose:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Step 5: Update src/index.css**

Replace contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 6: Commit**

```bash
git add .
git commit -m "chore: setup Tailwind CSS and shadcn/ui

```

---

## Task 3: Install shadcn/ui Components

**Files:**
- Create: `src/components/ui/*` (via CLI)

**Step 1: Install required UI components**

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add table
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
npx shadcn@latest add collapsible
npx shadcn@latest add tooltip
npx shadcn@latest add skeleton
```

**Step 2: Verify components installed**

Check that `src/components/ui/` contains all component files.

**Step 3: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui components

```

---

## Task 4: Create TypeScript Types

**Files:**
- Create: `src/lib/types.ts`

**Step 1: Define API response types**

Create `src/lib/types.ts`:

```typescript
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
```

**Step 2: Create utility types**

Add to `src/lib/types.ts`:

```typescript
export type ExportFormat = 'csv' | 'json'

export interface ColumnConfig {
  key: keyof TransformedStudy
  label: string
  visible: boolean
  sortable: boolean
}
```

**Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add TypeScript types for API and data structures

```

---

## Task 5: Create API Client

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/api.test.ts`

**Step 1: Write failing test for buildQueryUrl**

Create `src/lib/api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildQueryUrl } from './api'

describe('buildQueryUrl', () => {
  it('builds query with condition only', () => {
    const url = buildQueryUrl({
      condition: 'MSA',
      resultLimit: 100,
    })

    expect(url).toContain('query.cond=MSA')
    expect(url).toContain('pageSize=100')
    expect(url).toContain('format=json')
  })

  it('builds query with status filter', () => {
    const url = buildQueryUrl({
      condition: 'MSA',
      status: 'COMPLETED',
      resultLimit: 100,
    })

    expect(url).toContain('filter.overallStatus=COMPLETED')
  })

  it('encodes special characters in condition', () => {
    const url = buildQueryUrl({
      condition: 'Multiple System Atrophy',
      resultLimit: 100,
    })

    expect(url).toContain('Multiple%20System%20Atrophy')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- api.test.ts
```

Expected: FAIL with "Cannot find module './api'"

**Step 3: Write minimal implementation**

Create `src/lib/api.ts`:

```typescript
import type { QueryParams, StudyResponse } from './types'

const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies'

export function buildQueryUrl(params: QueryParams): string {
  const url = new URL(API_BASE_URL)

  // Add format
  url.searchParams.append('format', 'json')

  // Add page size
  url.searchParams.append('pageSize', params.resultLimit.toString())

  // Add condition filter
  if (params.condition) {
    url.searchParams.append('query.cond', params.condition)
  }

  // Add status filter
  if (params.status) {
    url.searchParams.append('filter.overallStatus', params.status)
  }

  return url.toString()
}

export async function fetchStudies(
  params: QueryParams,
  signal?: AbortSignal
): Promise<StudyResponse> {
  const url = buildQueryUrl(params)

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- api.test.ts
```

Expected: PASS

**Step 5: Add test for fetchStudies with mock**

Add to `src/lib/api.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('fetchStudies', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches studies from API', async () => {
    const mockResponse = {
      studies: [],
      totalCount: 0,
    }

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await fetchStudies({ resultLimit: 100 })

    expect(result).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('pageSize=100'),
      expect.any(Object)
    )
  })

  it('throws error on failed request', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchStudies({ resultLimit: 100 })).rejects.toThrow(
      'API request failed: 500 Internal Server Error'
    )
  })

  it('passes abort signal to fetch', async () => {
    const controller = new AbortController()

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ studies: [] }),
    })

    await fetchStudies({ resultLimit: 100 }, controller.signal)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    )
  })
})
```

**Step 6: Run tests**

```bash
npm test -- api.test.ts
```

Expected: All PASS

**Step 7: Commit**

```bash
git add src/lib/api.ts src/lib/api.test.ts
git commit -m "feat: add API client for ClinicalTrials.gov

- Build query URLs with proper encoding
- Fetch studies with abort signal support
- Handle API errors

```

---

## Task 6: Create Data Transformers

**Files:**
- Create: `src/lib/transformers.ts`
- Create: `src/lib/transformers.test.ts`

**Step 1: Write failing test for transformStudy**

Create `src/lib/transformers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { transformStudy } from './transformers'
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
```

**Step 2: Run test to verify it fails**

```bash
npm test -- transformers.test.ts
```

Expected: FAIL

**Step 3: Write implementation**

Create `src/lib/transformers.ts`:

```typescript
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
```

**Step 4: Run test to verify it passes**

```bash
npm test -- transformers.test.ts
```

Expected: All PASS

**Step 5: Add tests for client-side filtering**

Add to `src/lib/transformers.test.ts`:

```typescript
import { filterByDescription, filterByPhases, filterByHasResults } from './transformers'

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
```

**Step 6: Implement filtering functions**

Add to `src/lib/transformers.ts`:

```typescript
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
```

**Step 7: Run all tests**

```bash
npm test -- transformers.test.ts
```

Expected: All PASS

**Step 8: Commit**

```bash
git add src/lib/transformers.ts src/lib/transformers.test.ts
git commit -m "feat: add data transformers and filters

- Transform API studies to display format
- Client-side filtering by description, phase, results
- Format phase labels
- Handle missing fields gracefully

```

---

## Task 7: Create Export Utilities

**Files:**
- Create: `src/lib/export.ts`
- Create: `src/lib/export.test.ts`

**Step 1: Write failing test for CSV export**

Create `src/lib/export.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { exportToCSV, exportToJSON } from './export'
import type { TransformedStudy } from './types'

describe('exportToCSV', () => {
  it('converts studies to CSV format', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Test Study',
        sponsor: 'Test University',
        sponsorClass: 'OTHER',
        phase: 'Phase 2',
        status: 'COMPLETED',
        locationCount: 3,
        hasResults: true,
        conditions: 'MSA',
      },
    ]

    const csv = exportToCSV(studies)

    expect(csv).toContain('nctId,title,sponsor')
    expect(csv).toContain('NCT12345678,Test Study,Test University')
  })

  it('escapes commas in fields', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Study with, comma',
        sponsor: 'Test',
        sponsorClass: 'OTHER',
        phase: 'Phase 2, Phase 3',
        status: 'COMPLETED',
        locationCount: 1,
        hasResults: false,
        conditions: 'MSA, Parkinson',
      },
    ]

    const csv = exportToCSV(studies)

    expect(csv).toContain('"Study with, comma"')
    expect(csv).toContain('"Phase 2, Phase 3"')
    expect(csv).toContain('"MSA, Parkinson"')
  })

  it('handles empty array', () => {
    const csv = exportToCSV([])
    expect(csv).toBe('')
  })
})

describe('exportToJSON', () => {
  it('converts studies to JSON string', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Test Study',
        sponsor: 'Test',
        sponsorClass: 'OTHER',
        phase: 'Phase 2',
        status: 'COMPLETED',
        locationCount: 1,
        hasResults: true,
        conditions: 'MSA',
      },
    ]

    const json = exportToJSON(studies)
    const parsed = JSON.parse(json)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].nctId).toBe('NCT12345678')
  })

  it('formats with indentation', () => {
    const studies: TransformedStudy[] = [
      {
        nctId: 'NCT12345678',
        title: 'Test',
        sponsor: 'Test',
        sponsorClass: 'OTHER',
        phase: 'Phase 2',
        status: 'COMPLETED',
        locationCount: 1,
        hasResults: true,
        conditions: 'MSA',
      },
    ]

    const json = exportToJSON(studies)

    expect(json).toContain('  "nctId"')
    expect(json).toContain('\n')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- export.test.ts
```

Expected: FAIL

**Step 3: Write implementation**

Create `src/lib/export.ts`:

```typescript
import type { TransformedStudy } from './types'

export function exportToCSV(studies: TransformedStudy[]): string {
  if (studies.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(studies[0]) as Array<keyof TransformedStudy>

  // Create header row
  const headerRow = headers.join(',')

  // Create data rows
  const dataRows = studies.map(study => {
    return headers.map(key => {
      const value = study[key]

      // Handle undefined/null
      if (value === undefined || value === null) return ''

      // Convert to string
      const stringValue = String(value)

      // Escape if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

export function exportToJSON(studies: TransformedStudy[]): string {
  return JSON.stringify(studies, null, 2)
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generateFilename(format: 'csv' | 'json'): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `clinical-trials-${year}-${month}-${day}-${hours}${minutes}${seconds}.${format}`
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- export.test.ts
```

Expected: All PASS

**Step 5: Add test for downloadFile**

Add to `src/lib/export.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadFile, generateFilename } from './export'

describe('generateFilename', () => {
  it('generates filename with timestamp', () => {
    const filename = generateFilename('csv')

    expect(filename).toMatch(/^clinical-trials-\d{4}-\d{2}-\d{2}-\d{6}\.csv$/)
  })

  it('uses correct extension for JSON', () => {
    const filename = generateFilename('json')

    expect(filename).toMatch(/\.json$/)
  })
})

describe('downloadFile', () => {
  beforeEach(() => {
    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates download link and triggers click', () => {
    const clickMock = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement')

    downloadFile('test content', 'test.csv', 'text/csv')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
```

**Step 6: Run tests**

```bash
npm test -- export.test.ts
```

Expected: All PASS

**Step 7: Commit**

```bash
git add src/lib/export.ts src/lib/export.test.ts
git commit -m "feat: add CSV/JSON export utilities

- Convert studies to CSV with proper escaping
- Export to formatted JSON
- Generate timestamped filenames
- Trigger browser download

```

---

## Task 8: Create Query Hook

**Files:**
- Create: `src/hooks/useStudyQuery.ts`
- Create: `src/hooks/useStudyQuery.test.ts`

**Step 1: Write failing test**

Create `src/hooks/useStudyQuery.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStudyQuery } from './useStudyQuery'

describe('useStudyQuery', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useStudyQuery())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.results).toEqual([])
  })

  it('fetches studies on query', async () => {
    const mockResponse = {
      studies: [
        {
          protocolSection: {
            identificationModule: { nctId: 'NCT12345678' },
            statusModule: { overallStatus: 'COMPLETED' },
            sponsorCollaboratorsModule: {
              leadSponsor: { name: 'Test', class: 'OTHER' },
            },
          },
          hasResults: false,
        },
      ],
    }

    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useStudyQuery())

    result.current.executeQuery({ resultLimit: 100 })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.results).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('handles errors', async () => {
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useStudyQuery())

    result.current.executeQuery({ resultLimit: 100 })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toContain('Network error')
    expect(result.current.results).toEqual([])
  })

  it('can cancel query', async () => {
    ;(global.fetch as any).mockImplementation(() =>
      new Promise((resolve) => setTimeout(resolve, 1000))
    )

    const { result } = renderHook(() => useStudyQuery())

    result.current.executeQuery({ resultLimit: 100 })
    expect(result.current.isLoading).toBe(true)

    result.current.cancelQuery()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- useStudyQuery.test.ts
```

Expected: FAIL

**Step 3: Write implementation**

Create `src/hooks/useStudyQuery.ts`:

```typescript
import { useState, useRef, useCallback } from 'react'
import { fetchStudies } from '@/lib/api'
import { transformStudies, applyFilters } from '@/lib/transformers'
import type { QueryParams, Study, TransformedStudy } from '@/lib/types'

interface UseStudyQueryResult {
  isLoading: boolean
  error: string | null
  results: Study[]
  filteredResults: TransformedStudy[]
  executeQuery: (params: QueryParams) => Promise<void>
  cancelQuery: () => void
}

export function useStudyQuery(): UseStudyQueryResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Study[]>([])
  const [filteredResults, setFilteredResults] = useState<TransformedStudy[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)

  const executeQuery = useCallback(async (params: QueryParams) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      // Fetch from API
      const response = await fetchStudies(params, abortControllerRef.current.signal)

      const studies = response.studies || []

      // Apply client-side filters
      const filtered = applyFilters(studies, {
        descriptionSearch: params.descriptionSearch,
        phases: params.phases,
        hasResults: params.hasResults,
      })

      // Transform for display
      const transformed = transformStudies(filtered)

      setResults(studies)
      setFilteredResults(transformed)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Query was cancelled, don't set error
          return
        }
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelQuery = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    results,
    filteredResults,
    executeQuery,
    cancelQuery,
  }
}
```

**Step 4: Create test setup file**

Create `src/test/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

**Step 5: Run test to verify it passes**

```bash
npm test -- useStudyQuery.test.ts
```

Expected: All PASS

**Step 6: Commit**

```bash
git add src/hooks/useStudyQuery.ts src/hooks/useStudyQuery.test.ts src/test/setup.ts
git commit -m "feat: add useStudyQuery hook

- Execute queries with abort support
- Apply client-side filters
- Transform results for display
- Handle errors and loading states

```

---

## Task 9: Create Query Form Component

**Files:**
- Create: `src/components/QueryForm.tsx`

**Step 1: Write component**

Create `src/components/QueryForm.tsx`:

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { QueryParams } from '@/lib/types'

interface QueryFormProps {
  onSubmit: (params: QueryParams) => void
  isLoading: boolean
  onCancel: () => void
}

const PHASE_OPTIONS = [
  { value: 'EARLY_PHASE1', label: 'Early Phase 1' },
  { value: 'PHASE1', label: 'Phase 1' },
  { value: 'PHASE2', label: 'Phase 2' },
  { value: 'PHASE3', label: 'Phase 3' },
  { value: 'PHASE4', label: 'Phase 4' },
  { value: 'NA', label: 'N/A' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'RECRUITING', label: 'Recruiting' },
  { value: 'ACTIVE_NOT_RECRUITING', label: 'Active, not recruiting' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

const RESULT_LIMIT_OPTIONS = [
  { value: 100, label: '100' },
  { value: 500, label: '500' },
  { value: 1000, label: '1000' },
]

export function QueryForm({ onSubmit, isLoading, onCancel }: QueryFormProps) {
  const [condition, setCondition] = useState('')
  const [descriptionSearch, setDescriptionSearch] = useState('')
  const [status, setStatus] = useState('')
  const [hasResults, setHasResults] = useState(false)
  const [selectedPhases, setSelectedPhases] = useState<string[]>([])
  const [resultLimit, setResultLimit] = useState(100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params: QueryParams = {
      condition: condition || undefined,
      descriptionSearch: descriptionSearch || undefined,
      status: status || undefined,
      hasResults,
      phases: selectedPhases.length > 0 ? selectedPhases : undefined,
      resultLimit,
    }

    onSubmit(params)
  }

  const handlePhaseToggle = (phase: string) => {
    setSelectedPhases(prev =>
      prev.includes(phase)
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    )
  }

  const handleClear = () => {
    setCondition('')
    setDescriptionSearch('')
    setStatus('')
    setHasResults(false)
    setSelectedPhases([])
    setResultLimit(100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Clinical Trials</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition / Disease</Label>
            <Input
              id="condition"
              placeholder="e.g., MSA, Alzheimer's Disease"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>

          {/* Description Search */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description Search
              <span className="text-sm text-muted-foreground ml-2">
                (searches in descriptions and outcome measures)
              </span>
            </Label>
            <Input
              id="description"
              placeholder="e.g., CDR-SB, cognitive assessment"
              value={descriptionSearch}
              onChange={(e) => setDescriptionSearch(e.target.value)}
            />
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Study Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Has Results */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasResults"
              checked={hasResults}
              onCheckedChange={(checked) => setHasResults(checked === true)}
            />
            <Label htmlFor="hasResults" className="cursor-pointer">
              Only studies with published results
            </Label>
          </div>

          {/* Phase */}
          <div className="space-y-2">
            <Label>Study Phase</Label>
            <div className="grid grid-cols-2 gap-2">
              {PHASE_OPTIONS.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`phase-${option.value}`}
                    checked={selectedPhases.includes(option.value)}
                    onCheckedChange={() => handlePhaseToggle(option.value)}
                  />
                  <Label
                    htmlFor={`phase-${option.value}`}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Result Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Result Limit</Label>
            <Select
              value={resultLimit.toString()}
              onValueChange={(val) => setResultLimit(Number(val))}
            >
              <SelectTrigger id="limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULT_LIMIT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Running Query...' : 'Run Query'}
            </Button>
            {isLoading && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {!isLoading && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/QueryForm.tsx
git commit -m "feat: add QueryForm component

- Condition and description search inputs
- Status and phase filters
- Has results checkbox
- Result limit selector
- Clear and cancel actions

```

---

## Task 10: Create Results Table Component

**Files:**
- Create: `src/components/ResultsTable.tsx`

**Step 1: Write component**

Create `src/components/ResultsTable.tsx`:

```typescript
import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { TransformedStudy } from '@/lib/types'
import { useState } from 'react'

interface ResultsTableProps {
  data: TransformedStudy[]
}

export function ResultsTable({ data }: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TransformedStudy>[]>(
    () => [
      {
        accessorKey: 'nctId',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            NCT ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const nctId = row.getValue('nctId') as string
          return (
            <a
              href={`https://clinicaltrials.gov/study/${nctId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline font-mono"
            >
              {nctId}
              <ExternalLink className="h-3 w-3" />
            </a>
          )
        },
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-md truncate" title={row.getValue('title')}>
            {row.getValue('title')}
          </div>
        ),
      },
      {
        accessorKey: 'sponsor',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Sponsor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.getValue('sponsor')}>
            {row.getValue('sponsor')}
          </div>
        ),
      },
      {
        accessorKey: 'phase',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Phase
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const phase = row.getValue('phase') as string
          return <Badge variant="outline">{phase}</Badge>
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return <Badge>{status}</Badge>
        },
      },
      {
        accessorKey: 'locationCount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Locations
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('locationCount')}</div>
        ),
      },
      {
        accessorKey: 'sponsorClass',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Funder Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'hasResults',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Has Results
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const hasResults = row.getValue('hasResults') as boolean
          return (
            <div className="flex justify-center">
              {hasResults ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-gray-400" />
              )}
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No results yet</p>
        <p className="text-sm mt-2">Run a query to see clinical trial data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {data.length} {data.length === 1 ? 'result' : 'results'}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

**Step 2: Install lucide-react if not already**

```bash
npm install lucide-react
```

**Step 3: Commit**

```bash
git add src/components/ResultsTable.tsx
git commit -m "feat: add ResultsTable component

- Sortable columns with TanStack Table
- Linked NCT IDs to ClinicalTrials.gov
- Status and phase badges
- Has results indicator
- Empty state message

```

---

## Task 11: Create Export Buttons Component

**Files:**
- Create: `src/components/ExportButtons.tsx`

**Step 1: Write component**

Create `src/components/ExportButtons.tsx`:

```typescript
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV, exportToJSON, downloadFile, generateFilename } from '@/lib/export'
import type { TransformedStudy } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface ExportButtonsProps {
  data: TransformedStudy[]
  disabled?: boolean
}

export function ExportButtons({ data, disabled }: ExportButtonsProps) {
  const { toast } = useToast()

  const handleExportCSV = () => {
    try {
      const csv = exportToCSV(data)
      const filename = generateFilename('csv')
      downloadFile(csv, filename, 'text/csv')

      toast({
        title: 'Export successful',
        description: `Downloaded ${data.length} results as ${filename}`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleExportJSON = () => {
    try {
      const json = exportToJSON(data)
      const filename = generateFilename('json')
      downloadFile(json, filename, 'application/json')

      toast({
        title: 'Export successful',
        description: `Downloaded ${data.length} results as ${filename}`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const isDisabled = disabled || data.length === 0

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleExportCSV}
        disabled={isDisabled}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download CSV
      </Button>
      <Button
        variant="outline"
        onClick={handleExportJSON}
        disabled={isDisabled}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download JSON
      </Button>
    </div>
  )
}
```

**Step 2: Add Toaster to app**

The toast hook requires a Toaster component. We'll add it in the next task when we build the main app.

**Step 3: Commit**

```bash
git add src/components/ExportButtons.tsx
git commit -m "feat: add ExportButtons component

- CSV and JSON export buttons
- Disabled state when no data
- Toast notifications for success/error

```

---

## Task 12: Create Main App Component

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/components/Toaster.tsx`

**Step 1: Add Toaster component**

Create `src/components/Toaster.tsx`:

```typescript
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
```

**Step 2: Write main App component**

Replace `src/App.tsx` with:

```typescript
import { useState } from 'react'
import { QueryForm } from '@/components/QueryForm'
import { ResultsTable } from '@/components/ResultsTable'
import { ExportButtons } from '@/components/ExportButtons'
import { Toaster } from '@/components/Toaster'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertCircle } from 'lucide-react'
import { useStudyQuery } from '@/hooks/useStudyQuery'
import type { QueryParams } from '@/lib/types'

function App() {
  const { isLoading, error, filteredResults, executeQuery, cancelQuery } = useStudyQuery()
  const [showApiQuery, setShowApiQuery] = useState(false)
  const [lastQuery, setLastQuery] = useState<string>('')

  const handleSubmit = (params: QueryParams) => {
    // Build API query URL for display
    const url = new URL('https://clinicaltrials.gov/api/v2/studies')
    url.searchParams.append('format', 'json')
    url.searchParams.append('pageSize', params.resultLimit.toString())
    if (params.condition) url.searchParams.append('query.cond', params.condition)
    if (params.status) url.searchParams.append('filter.overallStatus', params.status)

    setLastQuery(url.toString())
    executeQuery(params)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Clinical Trials Query Tool</h1>
          <p className="text-muted-foreground">
            Search and download clinical trial data from ClinicalTrials.gov
          </p>
        </div>

        <Separator />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Query Form - left column */}
          <div className="lg:col-span-1">
            <QueryForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={cancelQuery}
            />
          </div>

          {/* Results - right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Action bar */}
            <div className="flex items-center justify-between">
              <ExportButtons data={filteredResults} disabled={isLoading} />

              {lastQuery && (
                <button
                  onClick={() => setShowApiQuery(!showApiQuery)}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  {showApiQuery ? 'Hide' : 'Show'} API Query
                </button>
              )}
            </div>

            {/* API Query Display */}
            {showApiQuery && lastQuery && (
              <Alert>
                <AlertDescription className="font-mono text-xs break-all">
                  {lastQuery}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Querying ClinicalTrials.gov...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            )}

            {/* Results Table */}
            {!isLoading && <ResultsTable data={filteredResults} />}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
```

**Step 3: Update main.tsx**

Replace `src/main.tsx` with:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 4: Update index.html title**

Edit `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clinical Trials Query Tool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Test the app locally**

```bash
npm run dev
```

Open browser to http://localhost:5173 and verify:
- Query form renders
- Can input values
- Submit triggers query

**Step 6: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/Toaster.tsx index.html
git commit -m "feat: add main App component

- Two-column layout with query form and results
- Export buttons and API query toggle
- Error and loading states
- Toast notifications

```

---

## Task 13: Create GitHub Actions Deployment Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create workflow file**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Add build script to package.json**

Verify `package.json` has build script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: add GitHub Actions deployment workflow

- Build on push to main
- Deploy to GitHub Pages
- Use official pages actions

```

---

## Task 14: Add README and Final Documentation

**Files:**
- Create: `README.md`
- Create: `.env.example` (if needed)

**Step 1: Create README**

Create `README.md`:

```markdown
# Clinical Trials Query Tool

A React-based web application for querying and downloading clinical trial data from [ClinicalTrials.gov](https://clinicaltrials.gov).

🔗 **Live Demo:** [https://[your-username].github.io/clinical-trials-query/](https://[your-username].github.io/clinical-trials-query/)

## Features

- 🔍 Query by condition, description, status, phase
- 📊 Sortable results table
- 📥 Export to CSV or JSON
- 🚫 Cancel long-running queries
- 🌐 No backend required (pure static app)
- 📱 Desktop-optimized interface

## Tech Stack

- React 18 + TypeScript
- Vite
- shadcn/ui (Tailwind CSS)
- TanStack Table
- ClinicalTrials.gov API v2

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/[your-username]/clinical-trials-query.git
cd clinical-trials-query

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Query Clinical Trials

1. **Enter search criteria:**
   - Condition/Disease (e.g., "MSA", "Alzheimer's Disease")
   - Description search terms (searches in study descriptions and outcome measures)
   - Study status (Recruiting, Completed, etc.)
   - Filter by studies with published results
   - Filter by study phase

2. **Run Query** to fetch results from ClinicalTrials.gov

3. **Review Results:**
   - Sort by any column
   - Click NCT ID to view full study on ClinicalTrials.gov
   - View location count, sponsor, phase, etc.

4. **Export Data:**
   - Download as CSV for spreadsheet analysis
   - Download as JSON for programmatic use

### Example Queries

**All completed MSA studies with results:**
- Condition: `MSA`
- Status: `Completed`
- ✓ Only studies with published results

**Studies using CDR-SB outcome measure:**
- Description Search: `CDR-SB`
- Status: `Completed`
- Phase: Phase 2, Phase 3

## API

This app uses the [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api):
- No authentication required
- Rate limit: 10 requests/second
- Public access to all ClinicalTrials.gov data

## Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

### Manual Deployment

```bash
# Build
npm run build

# Deploy (requires gh-pages package)
npm run deploy
```

### Configuration

Update `vite.config.ts` base path to match your repository name:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── QueryForm.tsx
│   ├── ResultsTable.tsx
│   └── ExportButtons.tsx
├── hooks/            # Custom React hooks
│   └── useStudyQuery.ts
├── lib/              # Core logic
│   ├── api.ts        # API client
│   ├── types.ts      # TypeScript types
│   ├── transformers.ts # Data transformation
│   └── export.ts     # CSV/JSON export
├── test/             # Test utilities
└── App.tsx           # Main app component
```

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT

## Acknowledgments

- Data source: [ClinicalTrials.gov](https://clinicaltrials.gov)
- Maintained by: National Library of Medicine (NLM)
```

**Step 2: Add test scripts to package.json**

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Step 3: Commit**

```bash
git add README.md package.json
git commit -m "docs: add README and documentation

- Setup instructions
- Usage examples
- Development guide
- Deployment instructions

```

---

## Task 15: Final Testing and Polish

**Files:**
- Various (bug fixes as needed)

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 2: Build for production**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 3: Preview production build**

```bash
npm run preview
```

Test the production build:
- [ ] Query form works
- [ ] Can fetch real data from API
- [ ] Table sorts correctly
- [ ] CSV export downloads
- [ ] JSON export downloads
- [ ] Cancel button works
- [ ] Error handling works
- [ ] API query display toggle works

**Step 4: Fix any issues found**

Make fixes and commit individually:

```bash
git add [files]
git commit -m "fix: [description]

```

**Step 5: Create initial release tag**

```bash
git tag -a v1.0.0 -m "Initial release"
```

**Step 6: Final commit**

```bash
git add .
git commit -m "chore: final polish for v1.0.0

```

---

## Deployment Instructions

### 1. Create GitHub Repository

```bash
# Create new repo on GitHub (via web UI or gh CLI)
gh repo create clinical-trials-query --public --source=. --remote=origin

# Or if repo already exists:
git remote add origin https://github.com/[username]/clinical-trials-query.git
```

### 2. Push to GitHub

```bash
git push -u origin main
git push --tags
```

### 3. Enable GitHub Pages

1. Go to repository Settings
2. Navigate to Pages
3. Source: "GitHub Actions"
4. Wait for deployment workflow to complete

### 4. Update README with live URL

Once deployed, update README.md with actual URL and commit.

---

## Success Criteria

✅ App builds without errors
✅ All tests pass
✅ Can query ClinicalTrials.gov API
✅ Results display in sortable table
✅ CSV export works
✅ JSON export works
✅ Query cancellation works
✅ Error handling works
✅ Deploys to GitHub Pages
✅ Responsive on desktop
✅ Accessible (keyboard navigation, ARIA labels)

---

## Future Enhancements (Post-Launch)

- Save query templates to localStorage
- Query history
- Column visibility toggles
- Advanced filters (date ranges, enrollment size)
- Results pagination for very large datasets
- Dark mode
- Results comparison view

---

## Notes

- **YAGNI:** Only implemented required features, no extras
- **TDD:** Wrote tests first for core logic (api, transformers, export, hooks)
- **DRY:** Reused components from shadcn/ui, extracted transformation logic
- **Frequent commits:** Small, focused commits with clear messages
- **Documentation:** Comprehensive README and inline code comments where needed
