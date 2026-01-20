import Dashboard from '@/components/Dashboard'
import { mockSuperAdminContext } from '@/lib/mock-context'

export default function Home() {
  return <Dashboard context={mockSuperAdminContext} />
}
