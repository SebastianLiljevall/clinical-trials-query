# Clinical Trials Query Application - Design Document

**Date:** 2026-02-03
**Status:** Approved
**Target Platform:** GitHub Pages (Static Hosting)

## Overview

A React-based web application for querying and downloading clinical trial data from ClinicalTrials.gov. Users can search studies by condition, description text, and various filters, then view results in a sortable table and export to CSV/JSON formats.

## Goals

- Enable researchers to query clinical trials data without database expertise
- Support common use cases: condition-based search, outcome measure search, results filtering
- Provide clean data export for further analysis
- Deploy as a pure static application (no backend required)

## Non-Goals

- Mobile/responsive support (desktop-only)
- Real-time data updates
- User authentication or multi-user features
- Data visualization or statistical analysis
- Direct AACT PostgreSQL database access

## Architecture

### Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui (Tailwind CSS + Radix UI)
- **Data Table:** TanStack Table
- **Routing:** React Router (hash routing for GitHub Pages)
- **Testing:** Vitest + React Testing Library
- **Deployment:** GitHub Pages via GitHub Actions

### Data Source

**ClinicalTrials.gov API v2**
- Base URL: `https://clinicaltrials.gov/api/v2/studies`
- Authentication: None required (public API)
- Rate Limit: 10 requests/second
- Format: JSON

**Why API v2 instead of AACT PostgreSQL:**
- Pure static deployment (no backend/proxy needed)
- No user credentials required
- Works directly from browser
- Simpler architecture

### Key Architectural Decisions

1. **Client-side filtering:** API supports basic filters, but outcome measure search and "has results" filtering happen client-side after fetch
2. **No credentials:** Using public API eliminates credential management complexity
3. **Hash routing:** Ensures proper routing on GitHub Pages without server configuration
4. **Owned components:** shadcn/ui components are copied into project (full control, no dependencies)

## Application Structure

### Pages

**1. Query Builder (Home) - `/`**
- Main interface for building and executing queries
- Three-panel layout: Query Form | Results Table | Action Bar

**2. Preferences - `/preferences`** (Optional/Future)
- Default result limit
- Default visible columns
- Saved query templates

### Project Structure

```
clinical-trials-query/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── QueryForm.tsx          # Search form with filters
│   │   ├── ResultsTable.tsx       # Data table with sorting
│   │   ├── ExportButtons.tsx      # CSV/JSON export
│   │   └── QueryProgress.tsx      # Loading states
│   ├── lib/
│   │   ├── api.ts                 # API client functions
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── transformers.ts        # Data transformation
│   │   └── utils.ts               # Helper functions
│   ├── hooks/
│   │   ├── useStudyQuery.ts       # Query execution hook
│   │   └── useQueryState.ts       # Form state management
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions deployment
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Feature Details

### Query Form

**Input Fields:**

1. **Condition Filter** (Text input)
   - Maps to API: `query.cond`
   - Example: "MSA", "Alzheimer's Disease"

2. **Description Search** (Text input)
   - Searches in study descriptions and outcome measures
   - Client-side filter (searches after fetch)
   - Example: "CDR-SB", "cognitive assessment"

3. **Study Status** (Dropdown)
   - Maps to API: `filter.overallStatus`
   - Options: All, Recruiting, Completed, Terminated, etc.

4. **Has Results** (Checkbox)
   - Client-side filter on `hasResults` field
   - Filters studies with published results

5. **Study Phase** (Multi-select checkboxes)
   - Options: Phase 1, Phase 2, Phase 3, Phase 4, N/A
   - Client-side filter on `designModule.phases[]`

6. **Result Limit** (Dropdown)
   - Options: 100, 500, 1000
   - Maps to API: `pageSize`

7. **Column Selector** (Checkboxes)
   - Choose which columns to display in table
   - Persisted to localStorage

**Actions:**
- **Run Query** - Execute search
- **Clear Filters** - Reset form to defaults
- **Show API Query** (Toggle) - Display constructed API URL

### Results Table

**Default Columns:**
- NCT ID (linked to ClinicalTrials.gov)
- Title
- Sponsor
- Phase
- Status
- Location Count
- Funder Type
- Has Results (✓/✗)

**Optional Columns:**
- Start Date
- Completion Date
- Enrollment Count
- Primary Outcome Measures
- Conditions
- Interventions

**Features:**
- Click column header to sort
- Click row to expand details (accordion)
- Sticky header on scroll
- Empty state with helpful message
- Loading skeleton during fetch

**Field Mappings (API → Display):**
- **NCT ID:** `protocolSection.identificationModule.nctId`
- **Title:** `protocolSection.identificationModule.officialTitle`
- **Sponsor:** `protocolSection.sponsorCollaboratorsModule.leadSponsor.name`
- **Phase:** `protocolSection.designModule.phases[]`
- **Status:** `protocolSection.statusModule.overallStatus`
- **Location Count:** `protocolSection.contactsLocationsModule.locations.length`
- **Funder Type:** `protocolSection.sponsorCollaboratorsModule.leadSponsor.class`
- **Has Results:** `hasResults` (boolean)
- **Outcome Measures:** `protocolSection.outcomesModule.primaryOutcomes[]`

### Export Functionality

**CSV Export:**
- All columns (visible + hidden)
- All filtered results (not paginated)
- Nested arrays flattened (comma-separated)
- Filename: `clinical-trials-YYYY-MM-DD-HHmmss.csv`
- Generated client-side with Blob API

**JSON Export:**
- Full study objects from API
- Preserves nested structure
- Useful for programmatic processing
- Filename: `clinical-trials-YYYY-MM-DD-HHmmss.json`

### Query Execution Flow

**Step 1: Build API Query**
```
User Input:
  Condition: "MSA"
  Status: "COMPLETED"
  Limit: 1000

↓

API Request:
  GET https://clinicaltrials.gov/api/v2/studies
    ?query.cond=MSA
    &filter.overallStatus=COMPLETED
    &pageSize=1000
    &format=json
```

**Step 2: Fetch Data**
- Show loading state with cancel button
- Use AbortController for cancellation
- 30-second timeout
- Handle rate limiting (429) with retry

**Step 3: Client-Side Filtering**
```typescript
// Filter by "has results"
if (hasResultsChecked) {
  studies = studies.filter(s => s.hasResults === true)
}

// Search in descriptions and outcome measures
if (descriptionSearch) {
  studies = studies.filter(s =>
    s.protocolSection.descriptionModule.briefSummary.includes(descriptionSearch) ||
    s.protocolSection.outcomesModule?.primaryOutcomes?.some(o =>
      o.measure.includes(descriptionSearch)
    )
  )
}

// Filter by phases
if (selectedPhases.length > 0) {
  studies = studies.filter(s =>
    s.protocolSection.designModule?.phases?.some(p =>
      selectedPhases.includes(p)
    )
  )
}
```

**Step 4: Transform & Display**
- Extract required fields from nested structure
- Populate table with transformed data
- Show result count

**Step 5: Enable Export**
- Download buttons become active
- Exports use filtered dataset

### Performance Optimizations

1. **Debounced API calls** - 500ms delay on form changes
2. **Query caching** - Cache recent queries in sessionStorage (key: query params, value: results)
3. **Virtual scrolling** - For tables > 500 rows (optional, if needed)
4. **Lazy loading** - Code-split route components
5. **Memoization** - React.memo on table rows
6. **AbortController** - Cancel in-flight requests on new query

## Error Handling

### API Errors

**Rate Limiting (429):**
- Toast notification: "Too many requests. Retrying in 3s..."
- Auto-retry with exponential backoff (3s, 6s, 12s)
- Manual "Retry Now" button

**Network Errors:**
- Toast: "Connection failed. Check your internet connection."
- Retry button
- Form state preserved

**Empty Results:**
- Friendly message: "No studies found matching your criteria"
- Suggestions: "Try broadening your search or removing filters"
- Show API query URL for debugging

**Malformed Data:**
- Log warnings to console
- Display "N/A" or "-" for missing fields
- Don't crash the app

**Query Timeout (30s):**
- Toast: "Query took too long. Try adding more filters to narrow results."
- Cancel button works throughout

### Edge Cases

**Large Result Sets:**
- Warn if results exceed display limit
- Message: "Showing first 1000 results. Download CSV for complete dataset."
- Full dataset available in exports

**LocalStorage Quota:**
- Catch quota exceeded when saving preferences
- Toast: "Unable to save preferences. Clear browser data or disable saved queries."

**Browser Compatibility:**
- Support: Chrome, Firefox, Safari, Edge (last 2 versions)
- Show warning for outdated browsers

## UI/UX Design

### Component Library: shadcn/ui

**Benefits:**
- Components copied into project (full ownership)
- Built on Radix UI (accessible by default)
- Tailwind-based (easy customization)
- Excellent Table component support

**Key Components:**
- Form: Input, Select, Checkbox, Button, Label
- Data: Table, Badge, Card, Tabs
- Feedback: Toast, Progress, Alert, Tooltip
- Layout: Separator, ScrollArea, Collapsible

### Visual Design

**Color Scheme:**
- Primary: Blue (actions, links)
- Success: Green ("has results" indicator)
- Muted: Gray (secondary information)
- Destructive: Red (cancel, errors)

**Typography:**
- Headers: font-semibold
- Data values: font-mono for IDs/codes
- Body: System fonts (fast loading)

**Spacing:**
- Generous whitespace
- Clear visual hierarchy
- Grouped related controls

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Space, Arrows)
- Screen reader announcements for loading/errors
- Proper heading hierarchy (h1, h2, h3)
- Focus indicators visible
- Color contrast WCAG AA compliant

### Interactions

- Hover states on table rows
- Smooth transitions (not jarring)
- Loading skeleton for table content
- Toast notifications slide in from top-right
- Collapsible row details with animation

## Deployment

### GitHub Pages Configuration

**Vite Config (`vite.config.ts`):**
```typescript
export default defineConfig({
  base: '/clinical-trials-query/', // Match repo name
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
  },
})
```

**Routing:**
- Use `HashRouter` from React Router
- URLs: `https://username.github.io/clinical-trials-query/#/`
- Simpler than BrowserRouter on GitHub Pages

### GitHub Actions Deployment

**Workflow (`.github/workflows/deploy.yml`):**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**GitHub Pages Settings:**
- Source: `gh-pages` branch
- Enforce HTTPS: Yes
- Custom domain: Optional

**Deployment URL:**
- `https://[username].github.io/[repo-name]/`

## Testing Strategy

### Unit Tests (Vitest)

**API Client (`lib/api.ts`):**
- Query building logic
- Response parsing
- Error handling
- Rate limit detection

**Transformers (`lib/transformers.ts`):**
- Field extraction from nested objects
- Array flattening for CSV
- Null/undefined handling

**Hooks (`hooks/useStudyQuery.ts`):**
- Query state management
- Cancellation logic
- Cache hit/miss behavior

### Integration Tests

**Query Flow:**
- Fill form → Click "Run Query" → Verify API called with correct params
- Mock API response → Verify table populated
- Apply filters → Verify client-side filtering works

**Export Flow:**
- Query results → Click "Download CSV" → Verify CSV generated
- Check CSV content matches table data

### Manual Testing Checklist

**Query Scenarios:**
- [ ] Query with condition only ("MSA")
- [ ] Query with description search ("CDR-SB")
- [ ] Query with multiple filters combined
- [ ] Filter by "has results"
- [ ] Filter by specific phases
- [ ] Empty result set
- [ ] Very large result set (1000+)

**Table Interactions:**
- [ ] Sort by each column
- [ ] Toggle column visibility
- [ ] Expand row details
- [ ] Scroll long table (sticky header)

**Export:**
- [ ] CSV export with data
- [ ] JSON export with data
- [ ] Export empty results (should show message)

**Error Handling:**
- [ ] Network disconnected during query
- [ ] Rate limit exceeded
- [ ] Query timeout (simulate slow response)
- [ ] Cancel running query

**Deployment:**
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in production build
- [ ] Base path correct for GitHub Pages
- [ ] Routing works (hash navigation)

### Browser Testing

**Primary:** Chrome (latest)
**Secondary:** Firefox, Safari, Edge (last 2 versions)

## Future Enhancements (Out of Scope)

- Saved query templates (localStorage)
- Query history
- Advanced SQL-like query builder
- Data visualization (charts, graphs)
- Batch export (multiple queries)
- API rate limit tracking display
- Dark mode
- Advanced filters (enrollment range, date ranges)
- Results comparison (side-by-side studies)

## References

- [ClinicalTrials.gov API v2 Documentation](https://clinicaltrials.gov/data-api/api)
- [Study Data Structure](https://clinicaltrials.gov/data-api/about-api/study-data-structure)
- [API v2 Announcement](https://www.nlm.nih.gov/pubs/techbull/ma24/ma24_clinicaltrials_api.html)
- [AACT Database](https://aact.ctti-clinicaltrials.org/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Table](https://tanstack.com/table)
- [Vite GitHub Pages Deployment](https://vitejs.dev/guide/static-deploy.html#github-pages)

## Approval

This design has been reviewed and approved for implementation.

**Approved by:** User
**Date:** 2026-02-03
