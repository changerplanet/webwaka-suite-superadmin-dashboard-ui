'use client'

import { useState, useMemo } from 'react'
import { DashboardContext, ResolvedDashboard, DashboardSnapshot } from '@/lib/types'
import { 
  resolveDashboard, 
  generateDashboardSnapshot, 
  evaluateFromSnapshot 
} from '@/lib/dashboard-control'
import Sidebar from './Sidebar'
import Header from './Header'
import SectionContent from './sections/SectionContent'

interface DashboardProps {
  context: DashboardContext
  initialSnapshot?: DashboardSnapshot | null
}

export default function Dashboard({ context, initialSnapshot }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDevMode, setShowDevMode] = useState(false)
  const [useSnapshot, setUseSnapshot] = useState(!!initialSnapshot)

  const resolvedDashboard: ResolvedDashboard = useMemo(() => {
    if (useSnapshot && initialSnapshot) {
      const fromSnapshot = evaluateFromSnapshot(initialSnapshot)
      if (fromSnapshot) {
        return fromSnapshot
      }
    }
    return resolveDashboard(context)
  }, [context, initialSnapshot, useSnapshot])

  const snapshot = useMemo(() => {
    return generateDashboardSnapshot(resolvedDashboard)
  }, [resolvedDashboard])

  const visibleSections = resolvedDashboard.sections.filter(s => s.visible)
  const [activeSection, setActiveSection] = useState(visibleSections[0]?.id || '')

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
                </div>
                <div>
                  <p className="font-medium text-purple-700">Resolution</p>
                  <p className="text-slate-600">Total: {resolvedDashboard.sections.length} sections</p>
                  <p className="text-slate-600">Visible: {visibleSections.length} sections</p>
                  <p className="text-slate-600">Hidden: {resolvedDashboard.sections.length - visibleSections.length} sections</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">Snapshot</p>
                  <p className="text-slate-600">Signature: {snapshot.signature}</p>
                  <p className="text-slate-600">Expires: {new Date(snapshot.expiresAt).toLocaleString()}</p>
                  <button
                    onClick={() => setUseSnapshot(!useSnapshot)}
                    className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                  >
                    {useSnapshot ? 'Use Live Resolution' : 'Use Snapshot'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
