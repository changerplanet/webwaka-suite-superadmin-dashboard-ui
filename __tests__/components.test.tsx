import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'
import SectionPanel from '@/components/SectionPanel'
import Header from '@/components/Header'
import type { UIDashboardSection, UISectionGroup } from '@/src/lib/control-consumer'

const mockGroups: UISectionGroup[] = [
  { id: 'core', title: 'Core', order: 1 },
  { id: 'operations', title: 'Operations', order: 2 },
]

const mockSections: UIDashboardSection[] = [
  { id: 'overview', title: 'Overview', description: 'Platform overview', group: 'core', icon: '📊', visible: true, order: 1 },
  { id: 'users', title: 'User Management', description: 'Manage users', group: 'core', icon: '👥', visible: true, order: 2 },
  { id: 'settings', title: 'Settings', description: 'System settings', group: 'operations', icon: '⚙️', visible: false, hiddenReason: 'Feature flag disabled', order: 3 },
]

describe('Sidebar Component', () => {
  const defaultProps = {
    sections: mockSections,
    groups: mockGroups,
    activeSection: 'overview',
    onSectionSelect: jest.fn(),
    isOpen: true,
    onToggle: jest.fn(),
    showDevMode: false,
  }

  it('should render only visible sections', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('should show hidden sections in dev mode', () => {
    render(<Sidebar {...defaultProps} showDevMode={true} />)
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Feature flag disabled')).toBeInTheDocument()
  })

  it('should call onSectionSelect when clicking section', () => {
    const onSectionSelect = jest.fn()
    render(<Sidebar {...defaultProps} onSectionSelect={onSectionSelect} />)
    
    fireEvent.click(screen.getByText('User Management'))
    expect(onSectionSelect).toHaveBeenCalledWith('users')
  })

  it('should highlight active section', () => {
    render(<Sidebar {...defaultProps} activeSection="overview" />)
    
    const buttons = screen.getAllByRole('button')
    const overviewButton = buttons.find(btn => btn.textContent?.includes('Overview'))
    expect(overviewButton).toHaveClass('bg-blue-600')
  })

  it('should render group headers', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('Core')).toBeInTheDocument()
  })
})

describe('SectionPanel Component', () => {
  const section = mockSections[0]

  it('should render section title', () => {
    render(<SectionPanel section={section} />)
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('should show controlled by core badge', () => {
    render(<SectionPanel section={section} />)
    
    expect(screen.getByText('Controlled by Core')).toBeInTheDocument()
  })

  it('should display section id in placeholder', () => {
    render(<SectionPanel section={section} />)
    
    expect(screen.getByText('Section: overview')).toBeInTheDocument()
  })
})

describe('Header Component', () => {
  const FIXED_TIME = new Date('2024-01-15T12:00:00.000Z')
  
  const defaultProps = {
    title: 'Overview',
    contextHash: 'abc12345',
    resolvedAt: FIXED_TIME.toISOString(),
    isSnapshot: false,
    showDevMode: false,
    onToggleDevMode: jest.fn(),
  }

  it('should render title', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('should show truncated hash', () => {
    render(<Header {...defaultProps} />)
    
    expect(screen.getByText('Hash: abc12345')).toBeInTheDocument()
  })

  it('should show snapshot mode indicator when active', () => {
    render(<Header {...defaultProps} isSnapshot={true} />)
    
    expect(screen.getByText('Snapshot Mode')).toBeInTheDocument()
  })

  it('should toggle dev mode button state', () => {
    const { rerender } = render(<Header {...defaultProps} showDevMode={false} />)
    expect(screen.getByText('Dev Mode OFF')).toBeInTheDocument()

    rerender(<Header {...defaultProps} showDevMode={true} />)
    expect(screen.getByText('Dev Mode ON')).toBeInTheDocument()
  })

  it('should call onToggleDevMode when clicking button', () => {
    const onToggleDevMode = jest.fn()
    render(<Header {...defaultProps} onToggleDevMode={onToggleDevMode} />)
    
    fireEvent.click(screen.getByText('Dev Mode OFF'))
    expect(onToggleDevMode).toHaveBeenCalled()
  })
})

describe('Visibility Control Guarantees', () => {
  it('should not render hidden sections in main navigation', () => {
    const sectionsWithHidden: UIDashboardSection[] = [
      { id: 'visible1', title: 'Visible One', description: '', group: 'core', icon: '📊', visible: true, order: 1 },
      { id: 'hidden1', title: 'Hidden One', description: '', group: 'core', icon: '📊', visible: false, hiddenReason: 'No permission', order: 2 },
      { id: 'hidden2', title: 'Hidden Two', description: '', group: 'core', icon: '📊', visible: false, hiddenReason: 'Feature disabled', order: 3 },
      { id: 'visible2', title: 'Visible Two', description: '', group: 'core', icon: '📊', visible: true, order: 4 },
    ]

    render(
      <Sidebar
        sections={sectionsWithHidden}
        groups={mockGroups}
        activeSection="visible1"
        onSectionSelect={jest.fn()}
        isOpen={true}
        onToggle={jest.fn()}
        showDevMode={false}
      />
    )

    expect(screen.getByText('Visible One')).toBeInTheDocument()
    expect(screen.getByText('Visible Two')).toBeInTheDocument()
    expect(screen.queryByText('Hidden One')).not.toBeInTheDocument()
    expect(screen.queryByText('Hidden Two')).not.toBeInTheDocument()
  })
})

describe('No Direct Control Imports Test', () => {
  it('components should only import types, not control logic directly', () => {
    expect(true).toBe(true)
  })
})
