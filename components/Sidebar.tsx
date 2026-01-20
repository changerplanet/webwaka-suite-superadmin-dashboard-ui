'use client'

import { DashboardSection } from '@/lib/types'

interface SidebarProps {
  sections: DashboardSection[]
  activeSection: string
  onSectionSelect: (sectionId: string) => void
  isOpen: boolean
  onToggle: () => void
  showDevMode: boolean
}

export default function Sidebar({
  sections,
  activeSection,
  onSectionSelect,
  isOpen,
  onToggle,
  showDevMode,
}: SidebarProps) {
  const visibleSections = sections.filter(s => s.visible)
  const hiddenSections = sections.filter(s => !s.visible)

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-800 text-slate-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">WebWaka</h1>
          <p className="text-sm text-slate-400 mt-1">Super Admin</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {visibleSections.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => onSectionSelect(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>

          {showDevMode && hiddenSections.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs uppercase text-slate-500 mb-3 px-4">Hidden Sections (Dev)</p>
              <ul className="space-y-1">
                {hiddenSections.map(section => (
                  <li key={section.id}>
                    <div className="px-4 py-2 text-slate-500 text-sm">
                      <span className="line-through">{section.title}</span>
                      {section.hiddenReason && (
                        <p className="text-xs text-slate-600 mt-1">{section.hiddenReason}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  )
}
