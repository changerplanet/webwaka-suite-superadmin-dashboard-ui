import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'
import { 
  mockSuperAdminContext, 
  mockLimitedContext,
  createMockSuperAdminContext,
  createMockLimitedContext 
} from '@/lib/mock-context'
import { 
  resolveDashboard, 
  generateDashboardSnapshot 
} from '@/src/lib/control-consumer'

const FIXED_TIME = new Date('2024-01-15T12:00:00.000Z')

function renderDashboardWithContext(context: typeof mockSuperAdminContext) {
  const resolved = resolveDashboard(context)
  return render(
    <Dashboard 
      context={context} 
      initialResolvedDashboard={resolved}
    />
  )
}

describe('Dashboard Component', () => {
  it('should render visible sections in sidebar', () => {
    renderDashboardWithContext(mockSuperAdminContext)
    
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /User Management/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Module Registry/i })).toBeInTheDocument()
  })

  it('should not render hidden sections by default', () => {
    renderDashboardWithContext(mockSuperAdminContext)
    
    const settingsElements = screen.queryAllByText('Settings')
    expect(settingsElements.length).toBe(0)
  })

  it('should show hidden sections in dev mode', () => {
    renderDashboardWithContext(mockSuperAdminContext)
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    expect(screen.getByText('System Config')).toBeInTheDocument()
  })

  it('should display context hash in header', () => {
    renderDashboardWithContext(mockSuperAdminContext)
    
    expect(screen.getByText(/Hash:/)).toBeInTheDocument()
  })

  it('should switch between sections when clicked', () => {
    renderDashboardWithContext(mockSuperAdminContext)
    
    fireEvent.click(screen.getByRole('button', { name: /User Management/i }))
    
    const headers = screen.getAllByText('User Management')
    expect(headers.length).toBeGreaterThan(1)
  })

  it('should render with limited context', () => {
    renderDashboardWithContext(mockLimitedContext)
    
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('User Management').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /^Module Registry$/i })).not.toBeInTheDocument()
  })

  it('should show snapshot details when available', () => {
    const context = createMockSuperAdminContext(FIXED_TIME)
    const dashboard = resolveDashboard(context)
    const snapshot = generateDashboardSnapshot(dashboard, context, 60)
    
    render(
      <Dashboard 
        context={context} 
        initialResolvedDashboard={dashboard}
        initialSnapshot={snapshot} 
      />
    )
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    expect(screen.getByText(/Checksum:/)).toBeInTheDocument()
  })

  it('should toggle snapshot mode when snapshot available', () => {
    const context = createMockSuperAdminContext(FIXED_TIME)
    const dashboard = resolveDashboard(context)
    const snapshot = generateDashboardSnapshot(dashboard, context, 60)

    render(
      <Dashboard 
        context={context} 
        initialResolvedDashboard={dashboard}
        initialSnapshot={snapshot} 
      />
    )
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    const snapshotButton = screen.getByText('Use Snapshot')
    fireEvent.click(snapshotButton)
    
    expect(screen.getByText('Use Live Resolution')).toBeInTheDocument()
  })

  it('should handle snapshot mode correctly', () => {
    const context = createMockSuperAdminContext(FIXED_TIME)
    const dashboard = resolveDashboard(context)
    const snapshot = generateDashboardSnapshot(dashboard, context, 60)

    render(
      <Dashboard 
        context={context} 
        initialResolvedDashboard={dashboard}
        initialSnapshot={snapshot} 
      />
    )

    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)

    const snapshotButton = screen.getByText('Use Snapshot')
    fireEvent.click(snapshotButton)
    
    expect(screen.getByText('Use Live Resolution')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Use Live Resolution'))
    expect(screen.getByText('Use Snapshot')).toBeInTheDocument()
  })

  it('should show no snapshot message when not available', () => {
    const context = createMockSuperAdminContext(FIXED_TIME)
    const dashboard = resolveDashboard(context)
    
    render(
      <Dashboard 
        context={context} 
        initialResolvedDashboard={dashboard}
      />
    )
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    expect(screen.getByText('No snapshot available')).toBeInTheDocument()
  })

  it('should display deterministic contextHash from canonical snapshot', () => {
    const context1 = createMockSuperAdminContext(FIXED_TIME)
    const context2 = createMockSuperAdminContext(FIXED_TIME)
    
    const dashboard1 = resolveDashboard(context1)
    const dashboard2 = resolveDashboard(context2)
    
    expect(dashboard1.contextHash).toBe(dashboard2.contextHash)
  })

  it('should have different contextHash for different contexts', () => {
    const context1 = createMockSuperAdminContext(FIXED_TIME)
    const context2 = createMockSuperAdminContext(new Date('2024-01-16T12:00:00.000Z'))
    
    const dashboard1 = resolveDashboard(context1)
    const dashboard2 = resolveDashboard(context2)
    
    expect(dashboard1.contextHash).not.toBe(dashboard2.contextHash)
  })
})
