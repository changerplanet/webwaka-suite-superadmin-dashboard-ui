# WebWaka Suite Superadmin Dashboard UI

## Overview
Declarative, controlled, minimal Super Admin Dashboard UI for the WebWaka Modular Platform. This UI is a pure consumer of Phase 4A dashboard declarations - it does not contain any business logic, hardcoded roles, or permission checks.

## Architecture
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

### Key Principles
- UI is declarative and controlled
- All visibility decisions come from Phase 4A control engine
- No hardcoded roles or permissions
- Supports snapshot-based offline evaluation
- Mobile-first, responsive design

## Project Structure
```
app/
  layout.tsx       - Root layout
  page.tsx         - Dashboard page
  globals.css      - Global styles
components/
  Dashboard.tsx    - Main dashboard component
  Sidebar.tsx      - Navigation sidebar with visibility controls
  Header.tsx       - Header with context info
  SectionPanel.tsx - Section renderer with "Controlled by Core" badge
lib/
  types.ts           - TypeScript interfaces
  dashboard-control.ts - Phase 4A integration (resolveDashboard, snapshots)
  mock-context.ts    - Mock contexts for development
__tests__/
  dashboard-control.test.ts - Control engine tests
  components.test.tsx       - Component tests
  Dashboard.test.tsx        - Dashboard integration tests
```

## Phase 4A Integration
The dashboard uses the following functions from the control layer:
- `resolveDashboard(context)` - Resolve visible sections based on permissions, entitlements, and feature flags
- `generateDashboardSnapshot(dashboard, ttl)` - Create signed snapshot for offline use
- `verifyDashboardSnapshot(snapshot)` - Verify snapshot integrity and expiration
- `evaluateFromSnapshot(snapshot)` - Render from snapshot if valid

## Development
```bash
npm run dev     # Start dev server on port 5000
npm run build   # Build for production
npm test        # Run tests
npm run test:coverage  # Run tests with coverage
```

## Guarantees
- No hardcoded roles in UI
- No permission logic in UI code
- All visibility controlled by Phase 4A resolver
- UI is purely declarative and controlled

## Recent Changes
- 2026-01-20: Implemented Next.js App Router with TypeScript
- 2026-01-20: Added Phase 4A dashboard control integration
- 2026-01-20: Created mobile-first responsive dashboard UI
- 2026-01-20: Added snapshot-based rendering support
- 2026-01-20: Expanded to 14 sections across 4 groups (Core, Governance, Platform, Operations)
- 2026-01-20: Added collapsible sidebar with group headers and icons
- 2026-01-20: Created reusable layout components (Breadcrumbs, SectionHeader, KpiPlaceholder, TablePlaceholder, ComingSoonBanner)
- 2026-01-20: Implemented section landing pages with KPI cards and data tables
- 2026-01-20: Added comprehensive test suite (43 tests)
