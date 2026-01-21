'use client'

import { useState, useMemo, useEffect } from 'react'
import type { 
  UIDashboardContext, 
  UIResolvedDashboard, 
  UIDashboardSnapshot 
} from '@/src/lib/control-consumer'
import Sidebar from './Sidebar'
import Header from './Header'
import SectionContent from './sections/SectionContent'

interface DashboardProps {
  context: UIDashboardContext
  initialResolvedDashboard: UIResolvedDashboard
  initialSnapshot?: UIDashboardSnapshot | null
}

export default function Dashboard({ 
  context, 
  initialResolvedDashboard,
  initialSnapshot 
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDevMode, setShowDevMode] = useState(false)
  const [useSnapshot, setUseSnapshot] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const resolvedDashboard = useMemo(() => {
    if (useSnapshot && initialSnapshot) {
      return initialSnapshot.dashboard
    }
    return initialResolvedDashboard
  }, [initialResolvedDashboard, initialSnapshot, useSnapshot])

  const visibleSections = resolvedDashboard.sections.filter(s => s.visible)

  useEffect(() => {
    const isActiveSectionVisible = visibleSections.some(s => s.id === activeSection)
    if (!isActiveSectionVisible && visibleSections.length > 0) {
      setActiveSection(visibleSections[0].id)
    }
  }, [visibleSections, activeSection])

  const currentSection = visibleSections.find(s => s.id === activeSection) || visibleSections[0]

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar
        sections={resolvedDashboard.sections}
        groups={resolvedDashboard.groups}
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        showDevMode={showDevMode}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header
          title={currentSection?.title || 'Dashboard'}
          contextHash={resolvedDashboard.contextHash}
          resolvedAt={resolvedDashboard.resolvedAt}
          isSnapshot={useSnapshot && !!initialSnapshot}
          showDevMode={showDevMode}
          onToggleDevMode={() => setShowDevMode(!showDevMode)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {currentSection && <SectionContent section={currentSection} />}
          
          {showDevMode && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-purple-800 mb-3">Dev Mode: Resolution Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-purple-700">Context</p>
                  <p className="text-slate-600">User: {context.userId}</p>
                  <p className="text-slate-600">Role: {context.role}</p>
                  <p className="text-slate-600">Tenant: {context.tenantId}</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">Resolution</p>
                  <p className="text-slate-600">Total: {resolvedDashboard.sections.length} sections</p>
                  <p className="text-slate-600">Visible: {visibleSections.length} sections</p>
                  <p className="text-slate-600">Hidden: {resolvedDashboard.sections.length - visibleSections.length} sections</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">Snapshot</p>
                  {initialSnapshot ? (
                    <>
                      <p className="text-slate-600">Checksum: {initialSnapshot.coreSnapshot.checksum}</p>
                      <p className="text-slate-600">Expires: {initialSnapshot.expiresAt}</p>
                    </>
                  ) : (
                    <p className="text-slate-600">No snapshot available</p>
                  )}
                  {initialSnapshot && (
                    <button
                      onClick={() => setUseSnapshot(!useSnapshot)}
                      className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                    >
                      {useSnapshot ? 'Use Live Resolution' : 'Use Snapshot'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
