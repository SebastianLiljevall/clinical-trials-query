# Clinical Trials Query Tool

A React-based web application for querying and downloading clinical trial data from [ClinicalTrials.gov](https://clinicaltrials.gov).

🔗 **Live Demo:** [https://sebastianliljevall.github.io/clinical-trials-query/](https://sebastianliljevall.github.io/clinical-trials-query/)

## Features

- 🔍 **Advanced Query Filters**
  - Search by condition/disease
  - Description and outcome measure search
  - Study status (Recruiting, Completed, etc.)
  - Study phase (Phase 1-4, Early Phase 1, N/A)
  - Filter by published results
  - Configurable result limits (100-1000)

- 📊 **Interactive Results Table**
  - Sortable columns
  - Direct links to ClinicalTrials.gov
  - Visual status indicators
  - Displays NCT ID, title, sponsor, phase, status, locations, and more

- 📥 **Export Capabilities**
  - Download as CSV (Excel-compatible)
  - Download as JSON (programmatic use)
  - Timestamped filenames

- 🎨 **Modern UI**
  - Dark mode support
  - Responsive layout
  - Clean, accessible design with shadcn/ui

- ⚡ **Performance**
  - Client-side filtering for fast results
  - Cancel long-running queries
  - No backend required (pure static app)

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui (Tailwind CSS + Radix UI)
- **Table:** TanStack Table
- **Data Source:** ClinicalTrials.gov API v2
- **Deployment:** GitHub Pages

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sebastianliljevall/clinical-trials-query.git
cd clinical-trials-query

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Testing
npm test              # Watch mode
npm run test:run      # Run once
npm run test:ui       # With UI
npm run test:coverage # With coverage

# Production build
npm run build
npm run preview
```

## Usage

### Querying Clinical Trials

1. **Enter Search Criteria**
   - **Condition/Disease:** e.g., "MSA", "Alzheimer's Disease"
   - **Description Search:** Searches in study descriptions and outcome measures (e.g., "CDR-SB")
   - **Study Status:** Filter by recruitment status
   - **Study Phase:** Select one or more phases
   - **Has Results:** Toggle to show only studies with published results
   - **Result Limit:** Choose 100, 500, or 1000 results

2. **Run Query**
   - Click "Run Query" to fetch data from ClinicalTrials.gov
   - Progress indicator shows during fetch
   - Cancel button available for long queries

3. **Review Results**
   - Click column headers to sort
   - Click NCT ID to view full study details on ClinicalTrials.gov
   - View study phase, status, sponsor, and location count

4. **Export Data**
   - Click "Download CSV" for spreadsheet analysis
   - Click "Download JSON" for programmatic processing
   - Files include timestamp in filename

### Example Queries

**Find completed MSA studies with results:**
- Condition: `MSA`
- Status: `Completed`
- ✓ Only studies with published results
- Result Limit: 500

**Studies using CDR-SB outcome measure:**
- Description Search: `CDR-SB`
- Status: `Completed`
- Phase: Phase 2, Phase 3

**All recruiting Alzheimer's trials:**
- Condition: `Alzheimer's Disease`
- Status: `Recruiting`
- Result Limit: 1000

## API

This app uses the [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api):

- **No authentication required**
- **Rate limit:** 10 requests/second
- **Public access** to all ClinicalTrials.gov data
- **Endpoints:** Studies data with filtering and pagination

## Deployment

### Automatic Deployment

The app automatically deploys to GitHub Pages when you push to the `main` branch via GitHub Actions.

### Manual Deployment Setup

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - Wait for deployment workflow to complete

2. **Update Base Path** (if needed)
   - Edit `vite.config.ts` to match your repository name:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   })
   ```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── QueryForm.tsx   # Search form
│   ├── ResultsTable.tsx # Data table
│   ├── ExportButtons.tsx # CSV/JSON export
│   ├── ThemeToggle.tsx  # Dark mode toggle
│   └── Toaster.tsx     # Toast notifications
├── hooks/              # Custom React hooks
│   ├── useStudyQuery.ts # Query execution hook
│   └── use-toast.ts    # Toast notifications hook
├── lib/                # Core logic
│   ├── api.ts          # API client
│   ├── types.ts        # TypeScript types
│   ├── transformers.ts # Data transformation & filtering
│   ├── export.ts       # CSV/JSON export utilities
│   └── utils.ts        # Utility functions
├── test/               # Test setup
└── App.tsx             # Main application component
```

## Testing

The project includes comprehensive test coverage:

- **25 tests** covering core functionality
- **API client tests:** Query building, fetching, error handling
- **Transformer tests:** Data transformation, filtering
- **Export tests:** CSV/JSON generation, file download
- **Hook tests:** Query execution, state management

Run tests with:
```bash
npm test
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier configured)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass (`npm test`)
- Ensure build succeeds (`npm run build`)

## License

MIT

## Acknowledgments

- **Data Source:** [ClinicalTrials.gov](https://clinicaltrials.gov)
- **Maintained by:** National Library of Medicine (NLM)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Support

If you encounter any issues or have questions:

1. Open an issue on GitHub
2. Review existing issues for similar problems

---

Built with ❤️ using React, TypeScript, and modern web technologies.
