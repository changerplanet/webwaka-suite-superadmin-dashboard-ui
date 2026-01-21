# WebWaka Suite Superadmin Dashboard UI

## Overview
Declarative, controlled, minimal Super Admin Dashboard UI for the WebWaka Modular Platform. This UI is a pure consumer of Phase 4A dashboard control packages - it does not contain any local control logic, hardcoded roles, or permission checks.

## Architecture

### Framework
- **Runtime**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

### Phase 4B-1 Canonical Control Integration (COMPLETED)

The UI consumes canonical control packages through a single integration point:

**Server-Side Resolution:**
- `app/page.tsx` - Server component that calls resolveDashboard() and generateDashboardSnapshot() where Node.js crypto is available
- Pre-resolved dashboard and snapshot are passed to client component

**Client-Side Display:**
- `components/Dashboard.tsx` - Pure client component receiving pre-resolved data
- No control package imports - only displays data and handles UI interactions

**Single Consumer Pattern:**
- `src/lib/control-consumer.ts` - ONLY file importing canonical control packages
- All visibility decisions flow through coreResolveDashboard()
- All checksums/integrity use coreGenerateDashboardSnapshot()
- contextHash derived from canonical snapshot checksum (NOT local hashing)

### Key Principles
- UI is declarative and controlled
- All visibility decisions come from Phase 4A control engine via canonical packages
- No hardcoded roles or permissions
- No local control logic - pure consumer pattern
- Supports snapshot-based offline evaluation
- Mobile-first, responsive design
- Deterministic evaluation using explicit timestamps

## Project Structure
```
app/
  layout.tsx       - Root layout
  page.tsx         - Server component: calls resolveDashboard, generateDashboardSnapshot
  globals.css      - Global styles
components/
  Dashboard.tsx    - Client component: displays pre-resolved data (no control imports)
  Sidebar.tsx      - Navigation sidebar with visibility controls
  Header.tsx       - Header with context info
  sections/        - Section content components
src/lib/
  control-consumer.ts  - SOLE import point for canonical control packages
lib/
  types.ts           - TypeScript interfaces (types only, no control logic)
  mock-context.ts    - Mock contexts for development
__mocks__/
  webwaka-core-dashboard-control.ts        - Jest mock implementing canonical logic
  webwaka-suite-superadmin-dashboard-control.ts - Jest mock for suite package
__tests__/
  dashboard-control.test.ts - Control consumer tests (45 tests)
  components.test.tsx       - Component tests
  Dashboard.test.tsx        - Dashboard integration tests
```

## Canonical Package Integration

The control-consumer.ts provides these functions by delegating to canonical packages:

- `resolveDashboard(context)` - Delegates to coreResolveDashboard, returns UI format with canonical checksum
- `generateDashboardSnapshot(dashboard, context, ttl)` - Delegates to coreGenerateDashboardSnapshot
- `verifyDashboardSnapshot(snapshot)` - Delegates to coreVerifyDashboardSnapshot
- `evaluateFromSnapshot(snapshot)` - Delegates to coreEvaluateFromSnapshot

### Known Limitations (Documented)
1. **Dashboard Declaration**: Remains local because webwaka-suite-superadmin-dashboard-control is substrate-only (TODO: import when package exports declaration)
2. **Jest Mocks**: Implement canonical logic for ESM compatibility; production uses real packages
3. **Crypto Requirements**: Canonical packages require server environment (Node.js crypto)

## Development
```bash
npm run dev     # Start dev server on port 5000
npm run build   # Build for production
npm test        # Run tests
```

## Recent Changes
- 2024-01-21: Phase 4B-1 Remediation completed
  - Refactored to server-side resolution architecture
  - control-consumer.ts is now the ONLY file importing control packages
  - Dashboard.tsx is a pure client component with no control imports
  - contextHash derived from canonical snapshot checksum
  - All 45 tests passing, production build successful
