# Outcome Measures and Statistical Results Design

**Date:** 2026-02-03
**Status:** Approved

## Overview

Extend the clinical trials query tool to display detailed outcome measures and statistical results from studies with published results. This adds two new table views alongside the existing study-level view, allowing users to analyze individual group measurements and between-group comparisons.

## Current State

The app currently:
- Fetches studies from ClinicalTrials.gov API v2
- Displays one row per study in a table
- Shows study metadata (NCT ID, title, sponsor, phase, status, locations, etc.)
- Has a "Only studies with published results" filter
- Exports data as CSV/JSON

The `resultsSection.outcomeMeasuresModule` exists in API responses but is not extracted or displayed.

## Proposed Changes

### Three-Table Architecture

**Table 1: Studies (Enhanced)**
- Always available
- One row per study
- **New:** Add Conditions column
- Purpose: Study metadata for joining with outcome/comparison data
- Export: `clinical-trials-studies-{timestamp}.csv`

**Table 2: Outcome Measures (New)**
- Only visible when "Only studies with published results" is checked
- One row per outcome measure
- Shows individual group measurements (N, estimate, SE for each treatment group)
- Supports multiple groups dynamically
- Export: `clinical-trials-outcomes-{timestamp}.csv`

**Table 3: Statistical Comparisons (New)**
- Only visible when "Only studies with published results" is checked
- One row per statistical comparison between groups
- Shows difference estimates, standard errors, p-values
- Export: `clinical-trials-comparisons-{timestamp}.csv`

### UI Flow

1. User applies filters (including "Only studies with published results")
2. If results filter is OFF: Show Table 1 (Studies) only
3. If results filter is ON: Show toggle to switch between all three tables
4. Each table has its own CSV export button
5. Users can export all three tables and join them via NCT ID

### Join Key

All tables share **NCT ID** as the primary join key. For outcome-specific joins, use **NCT ID + Endpoint**.

## Data Structures

### Table 1: Studies (Enhanced TransformedStudy)

```typescript
interface TransformedStudy {
  nctId: string                    // "NCT01234567"
  title: string                    // "Study of Drug X..."
  conditions: string               // "MSA, Parkinson's Disease" (NEW)
  sponsor: string                  // "University Hospital"
  sponsorClass: string            // "OTHER"
  phase: string                   // "Phase 2, Phase 3"
  status: string                  // "Completed"
  locationCount: number           // 15
  hasResults: boolean             // true
  startDate?: string              // "2020-01-15"
  completionDate?: string         // "2023-06-30"
  enrollmentCount?: number        // 120
  primaryOutcomes?: string        // "UMSARS TS change; Quality of life"
}
```

### Table 2: Outcome Measures

```typescript
interface TransformedOutcomeMeasure {
  // Study identifiers
  nctId: string                    // "NCT01234567"
  conditions: string               // "MSA, Parkinson's Disease"

  // Outcome measure details
  outcomeType: string             // "PRIMARY" or "SECONDARY"
  endpoint: string                // "UMSARS TS change from baseline"
  timeFrame: string               // "12 weeks"
  unitOfMeasure?: string          // "points", "mg/dL", etc.

  // Group results (dynamic array)
  groups: Array<{
    name: string                  // "Drug X 100mg", "Placebo", etc.
    n?: number                    // 60
    estimate?: string             // "-5.2"
    se?: string                   // "1.3"
  }>
}
```

**CSV Export Format:**
Columns: `NCT ID`, `Conditions`, `Outcome Type`, `Endpoint`, `Time Frame`, `Unit`, `Group 1 Name`, `Group 1 N`, `Group 1 Estimate`, `Group 1 SE`, `Group 2 Name`, `Group 2 N`, `Group 2 Estimate`, `Group 2 SE`, ...

### Table 3: Statistical Comparisons

```typescript
interface TransformedComparison {
  // Study identifiers
  nctId: string                    // "NCT01234567"
  conditions: string               // "MSA, Parkinson's Disease"

  // Outcome measure details
  outcomeType: string             // "PRIMARY" or "SECONDARY"
  endpoint: string                // "UMSARS TS change from baseline"
  timeFrame: string               // "12 weeks"

  // Comparison details
  group1Name: string              // "Drug X 100mg"
  group2Name: string              // "Placebo"

  // Comparison statistics
  differenceEstimate?: string     // "-3.7"
  differenceSE?: string           // "1.8"
  pValue?: string                 // "0.042"
  statisticalMethod?: string      // "ANCOVA", "t-test", etc.
  ciLowerLimit?: string           // Confidence interval
  ciUpperLimit?: string
  ciPctValue?: string             // "95"
}
```

## API Data Structure

The `resultsSection.outcomeMeasuresModule` structure:

```typescript
interface OutcomeMeasuresModule {
  outcomeMeasures: OutcomeMeasureResult[]
}

interface OutcomeMeasureResult {
  type: "PRIMARY" | "SECONDARY"
  title: string                    // Endpoint/measure name
  description?: string
  timeFrame: string
  paramType?: string              // "MEAN", "MEDIAN", etc.
  dispersionType?: string         // "STANDARD_ERROR", "STANDARD_DEVIATION"
  unitOfMeasure?: string

  // Treatment/control groups
  groups: Array<{
    id: string
    title: string                 // Group name
    description?: string
  }>

  // Participant counts
  denoms?: Array<{
    units: string
    counts: Array<{
      groupId: string
      value: number               // N for this group
    }>
  }>

  // Measurements for each group (nested structure)
  classes?: Array<{
    title?: string
    categories?: Array<{
      measurements: Array<{
        groupId: string           // Links to groups[].id
        value: string             // The estimate
        spread?: string           // SE or SD
        lowerLimit?: string
        upperLimit?: string
        comment?: string
      }>
    }>
  }>

  // Statistical comparisons between groups
  analyses?: Array<{
    groupIds: string[]            // Which groups being compared
    paramType?: string            // "MEAN_DIFFERENCE", etc.
    paramValue?: number           // Difference estimate
    dispersionType?: string       // "STANDARD_ERROR"
    dispersionValue?: number      // SE of difference
    pValue?: string               // p-value
    pValueComment?: string
    statisticalMethod?: string
    ciNumSides?: string
    ciPctValue?: string
    ciLowerLimit?: string
    ciUpperLimit?: string
  }>
}
```

## Transformation Logic

### Study-Level Transform (Enhanced)

```typescript
function transformStudy(study: Study): TransformedStudy {
  // Existing logic...

  // ADD: Extract conditions
  const conditions = study.protocolSection.conditionsModule?.conditions?.join(', ') || 'N/A'

  return {
    // existing fields...
    conditions,  // NEW
  }
}
```

### Outcome Measures Transform (New)

```typescript
function transformToOutcomeMeasures(studies: Study[]): TransformedOutcomeMeasure[] {
  const results: TransformedOutcomeMeasure[] = []

  for (const study of studies) {
    // Skip if no results section
    if (!study.hasResults || !study.resultsSection?.outcomeMeasuresModule) {
      continue
    }

    const nctId = study.protocolSection.identificationModule.nctId
    const conditions = study.protocolSection.conditionsModule?.conditions?.join(', ') || 'N/A'
    const outcomeMeasures = study.resultsSection.outcomeMeasuresModule.outcomeMeasures || []

    for (const outcome of outcomeMeasures) {
      // Extract group measurements
      const groups = extractGroupMeasurements(outcome)

      results.push({
        nctId,
        conditions,
        outcomeType: outcome.type,
        endpoint: outcome.title,
        timeFrame: outcome.timeFrame,
        unitOfMeasure: outcome.unitOfMeasure,
        groups,
      })
    }
  }

  return results
}

function extractGroupMeasurements(outcome: OutcomeMeasureResult): GroupMeasurement[] {
  const groups: GroupMeasurement[] = []

  // Get group names
  const groupDefinitions = outcome.groups || []

  // Get participant counts
  const denomCounts = outcome.denoms?.[0]?.counts || []
  const countMap = new Map(denomCounts.map(c => [c.groupId, c.value]))

  // Get measurements (navigate nested structure)
  const measurements = outcome.classes?.[0]?.categories?.[0]?.measurements || []
  const measurementMap = new Map(measurements.map(m => [m.groupId, m]))

  // Combine data for each group
  for (const groupDef of groupDefinitions) {
    const measurement = measurementMap.get(groupDef.id)
    const count = countMap.get(groupDef.id)

    groups.push({
      name: groupDef.title,
      n: count,
      estimate: measurement?.value,
      se: measurement?.spread,
    })
  }

  return groups
}
```

### Comparisons Transform (New)

```typescript
function transformToComparisons(studies: Study[]): TransformedComparison[] {
  const results: TransformedComparison[] = []

  for (const study of studies) {
    if (!study.hasResults || !study.resultsSection?.outcomeMeasuresModule) {
      continue
    }

    const nctId = study.protocolSection.identificationModule.nctId
    const conditions = study.protocolSection.conditionsModule?.conditions?.join(', ') || 'N/A'
    const outcomeMeasures = study.resultsSection.outcomeMeasuresModule.outcomeMeasures || []

    for (const outcome of outcomeMeasures) {
      const analyses = outcome.analyses || []
      const groupMap = new Map(outcome.groups?.map(g => [g.id, g.title]))

      for (const analysis of analyses) {
        // Extract group names
        const [group1Id, group2Id] = analysis.groupIds || []
        const group1Name = groupMap.get(group1Id) || 'Unknown'
        const group2Name = groupMap.get(group2Id) || 'Unknown'

        results.push({
          nctId,
          conditions,
          outcomeType: outcome.type,
          endpoint: outcome.title,
          timeFrame: outcome.timeFrame,
          group1Name,
          group2Name,
          differenceEstimate: analysis.paramValue?.toString(),
          differenceSE: analysis.dispersionValue?.toString(),
          pValue: analysis.pValue,
          statisticalMethod: analysis.statisticalMethod,
          ciLowerLimit: analysis.ciLowerLimit,
          ciUpperLimit: analysis.ciUpperLimit,
          ciPctValue: analysis.ciPctValue,
        })
      }
    }
  }

  return results
}
```

## Edge Cases and Data Handling

### Missing Data

- **No results section**: Skip study in outcome/comparison tables
- **Empty outcome measures**: Skip study
- **Missing measurements**: Show "N/A" or leave empty
- **Missing comparisons**: Outcome measure appears in Table 2 but not Table 3
- **Missing SE/spread**: Show estimate only, SE as "N/A"

### Multiple Groups

- Support any number of groups (2, 3, 4+)
- Dynamically add columns in CSV export
- For comparisons, show all pairwise comparisons reported in the API

### Data Type Variations

- **Dispersion types**: Handle both STANDARD_ERROR and STANDARD_DEVIATION
- **Parameter types**: Support MEAN, MEDIAN, COUNT, NUMBER, etc.
- Label columns accordingly or normalize to common format

### Nested Structure Navigation

The API's nested `classes → categories → measurements` structure can vary:
- Some outcomes have single class/category
- Some have multiple for different subgroups
- Strategy: Extract from first class/category for simplicity
- Log warning if multiple classes exist (edge case for future enhancement)

## Export Functionality

### CSV Export

Each table gets its own export function:

```typescript
function exportStudiesCSV(studies: TransformedStudy[]): void {
  const filename = `clinical-trials-studies-${timestamp}.csv`
  // Generate CSV with all study columns
}

function exportOutcomeMeasuresCSV(outcomes: TransformedOutcomeMeasure[]): void {
  const filename = `clinical-trials-outcomes-${timestamp}.csv`
  // Flatten groups array into columns: Group 1 Name, Group 1 N, etc.
}

function exportComparisonsCSV(comparisons: TransformedComparison[]): void {
  const filename = `clinical-trials-comparisons-${timestamp}.csv`
  // Standard CSV with fixed columns
}
```

### JSON Export

Maintain JSON export for programmatic use, with the same three-file structure.

## UI Components

### Table Toggle

When "Only studies with published results" is checked:
```
[Studies] [Outcome Measures] [Comparisons]
```

Toggle buttons to switch between views. Active view is highlighted.

### Export Buttons

Each table shows its own export buttons:
```
[Download CSV] [Download JSON]
```

Filenames indicate which table is being exported.

### Helper Text

Show count of items in current view:
- "Showing 145 studies"
- "Showing 387 outcome measures from 145 studies"
- "Showing 512 comparisons from 145 studies"

## Testing Strategy

### Unit Tests

1. **Transformation functions**
   - Test with complete data
   - Test with missing fields
   - Test with 0, 1, 2, 3+ outcome measures
   - Test with 0, 1, 2, 3+ groups
   - Test with missing analyses

2. **Export functions**
   - Test CSV generation for all three tables
   - Test dynamic column generation for multiple groups
   - Test proper escaping of special characters

3. **View switching**
   - Test toggle behavior
   - Test data refresh when switching views

### Integration Tests

1. **Full flow**: Query → Filter → View outcome measures → Export
2. **Real API data**: Test with actual ClinicalTrials.gov responses
3. **Edge cases**: Studies with unusual result structures

## Implementation Notes

### Type Safety

- Define all TypeScript interfaces strictly
- Use type guards when navigating nested API structures
- Handle optional fields gracefully

### Performance

- Transformation happens client-side after API fetch
- Consider memoization for expensive transformations
- For large result sets (1000+ studies), optimize rendering

### Accessibility

- Ensure table toggle is keyboard accessible
- Add ARIA labels for screen readers
- Maintain focus management when switching views

### Future Enhancements

- Filter/search within outcome measures table
- Sort by p-value, effect size, etc.
- Visualizations (forest plots, effect size charts)
- Support for more complex nested analyses
- Export all three tables as a single Excel workbook with sheets

## Implementation Order

1. Define TypeScript interfaces for `resultsSection.outcomeMeasuresModule`
2. Add Conditions column to existing study table
3. Implement outcome measures transformation
4. Implement comparisons transformation
5. Create table toggle UI component
6. Update export functions for all three tables
7. Add tests
8. Update documentation

## Success Criteria

- ✅ Conditions column appears in studies table
- ✅ Outcome measures table shows when results filter is on
- ✅ Comparisons table shows when results filter is on
- ✅ Toggle switches between three tables seamlessly
- ✅ Each table exports to separate CSV with correct columns
- ✅ Multiple treatment groups are handled correctly
- ✅ Missing data displays as "N/A" without errors
- ✅ All existing functionality continues to work
- ✅ Tests pass with good coverage
