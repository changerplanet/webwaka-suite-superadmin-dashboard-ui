import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'
import { mockSuperAdminContext, mockLimitedContext } from '@/lib/mock-context'
import { resolveDashboard, generateDashboardSnapshot } from '@/lib/dashboard-control'

describe('Dashboard Component', () => {
  it('should render visible sections in sidebar', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /User Management/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Module Registry/i })).toBeInTheDocument()
  })

  it('should not render hidden sections by default', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    const settingsElements = screen.queryAllByText('Settings')
    expect(settingsElements.length).toBe(0)
  })

  it('should show hidden sections in dev mode', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    const devModeButton = screen.getByText('Dev Mode OFF')
    fireEvent.click(devModeButton)
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should display context hash in header', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText(/Hash:/)).toBeInTheDocument()
  })

  it('should switch between sections when clicked', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    fireEvent.click(screen.getByRole('button', { name: /User Management/i }))
    
    const headers = screen.getAllByText('User Management')
    expect(headers.length).toBeGreaterThan(1)
  })

  it('should render with limited context', () => {
    render(<Dashboard context={mockLimitedContext} />)
    
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('User Management').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /^Module Registry$/i })).not.toBeInTheDocument()
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
    expect(screen.getAllByText(/Super Admin/i).length).toBeGreaterThan(0)
  })

  it('should render group headers in sidebar', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText('Core')).toBeInTheDocument()
    expect(screen.getByText('Governance')).toBeInTheDocument()
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
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

describe('Layout Tests', () => {
  it('should render breadcrumbs', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render KPI placeholders', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('should render table placeholder', () => {
    render(<Dashboard context={mockSuperAdminContext} />)
    
    expect(screen.getByText('Activity')).toBeInTheDocument()
  })
})

describe('Defensive Copy Tests', () => {
  it('should return defensive copy of groups from resolveDashboard', () => {
    const dashboard1 = resolveDashboard(mockSuperAdminContext)
    const dashboard2 = resolveDashboard(mockSuperAdminContext)
    
    expect(dashboard1.groups).not.toBe(dashboard2.groups)
    expect(dashboard1.groups[0]).not.toBe(dashboard2.groups[0])
  })
})
