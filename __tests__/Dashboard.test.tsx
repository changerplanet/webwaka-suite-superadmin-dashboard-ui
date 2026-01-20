import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'
import { mockSuperAdminContext, mockLimitedContext } from '@/lib/mock-context'
import { resolveDashboard, generateDashboardSnapshot } from '@/lib/dashboard-control'

describe('Dashboard Component', () => {
  it('should render visible sections in sidebar', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'User Management' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Module Registry' })).toBeInTheDocument()
  })

  it('should not render hidden sections by default', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.queryByText('System Settings')).not.toBeInTheDocument()
  })

  it('should show hidden sections in dev mode', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    expect(screen.getByText('System Settings')).toBeInTheDocument()
  })

  it('should display context hash in header', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText(/Hash:/)).toBeInTheDocument()
  })

  it('should switch between sections when clicked', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'User Management' }))
    
    const headers = screen.getAllByText('User Management')
    expect(headers.length).toBeGreaterThan(1)
  })

  it('should render with limited context', () => {
    render(<Dashboard context={mockLimitedContext} />)
    
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('User Management').length).toBeGreaterThan(0)
    expect(screen.queryByText('Module Registry')).not.toBeInTheDocument()
  })

  it('should show snapshot mode when using snapshot', () => {
    const dashboard = resolveDashboard(mockSuperAdminContext)
    const snapshot = generateDashboardSnapshot(dashboard, 60)
    
    render(<Dashboard context={mockSuperAdminContext} initialSnapshot={snapshot} />)
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    expect(screen.getByText('Snapshot Mode')).toBeInTheDocument()
  })

  it('should toggle snapshot mode in dev panel', () => {
    const dashboard = resolveDashboard(mockSuperAdminContext)
    const snapshot = generateDashboardSnapshot(dashboard, 60)
    
    render(<Dashboard context={mockSuperAdminContext} initialSnapshot={snapshot} />)
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    const snapshotButton = screen.getByText('Use Live Resolution')
    fireEvent.click(snapshotButton)
    
    expect(screen.queryByText('Snapshot Mode')).not.toBeInTheDocument()
  })

  it('should show controlled by core badge', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText('Controlled by Core')).toBeInTheDocument()
  })

  it('should display WebWaka branding', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getAllByText('WebWaka').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Super Admin').length).toBeGreaterThan(0)
  })
})

describe('Dashboard Deterministic Rendering', () => {
  it('should produce same output for same input', () => {
    const { container: container1 } = render(<Dashboard context={mockSuperAdminContext} />)
    const { container: container2 } = render(<Dashboard context={mockSuperAdminContext} />)
    
    const visibleSections1 = container1.querySelectorAll('nav button').length
    const visibleSections2 = container2.querySelectorAll('nav button').length
    
    expect(visibleSections1).toBe(visibleSections2)
  })

  it('should match live and snapshot rendering', () => {
    const dashboard = resolveDashboard(mockSuperAdminContext)
    const snapshot = generateDashboardSnapshot(dashboard, 60)
    
    const { container: liveContainer } = render(<Dashboard context={mockSuperAdminContext} />)
    const { container: snapshotContainer } = render(
      <Dashboard context={mockSuperAdminContext} initialSnapshot={snapshot} />
    )
    
    const liveSections = liveContainer.querySelectorAll('nav button').length
    const snapshotSections = snapshotContainer.querySelectorAll('nav button').length
    
    expect(liveSections).toBe(snapshotSections)
  })
})
