import Dashboard from '@/components/Dashboard'
import { 
  resolveDashboard, 
  generateDashboardSnapshot 
} from '@/src/lib/control-consumer'
import { mockSuperAdminContext } from '@/lib/mock-context'

export default function Home() {
  const resolvedDashboard = resolveDashboard(mockSuperAdminContext)
  
  let snapshot = null
  try {
    snapshot = generateDashboardSnapshot(resolvedDashboard, mockSuperAdminContext)
  } catch {
    // Snapshot generation may fail in some environments
  }
  
  return (
    <Dashboard 
      context={mockSuperAdminContext}
      initialResolvedDashboard={resolvedDashboard}
      initialSnapshot={snapshot}
    />
  )
}
