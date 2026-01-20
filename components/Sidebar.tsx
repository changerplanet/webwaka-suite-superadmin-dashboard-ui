'use client'

import { useState } from 'react'
import { DashboardSection, SectionGroup } from '@/lib/types'

interface SidebarProps {
  sections: DashboardSection[]
  groups: SectionGroup[]
  activeSection: string
  onSectionSelect: (sectionId: string) => void
  isOpen: boolean
  onToggle: () => void
  showDevMode: boolean
}

export default function Sidebar({
  sections,
  groups,
  activeSection,
  onSectionSelect,
  isOpen,
  onToggle,
  showDevMode,
}: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const visibleSections = sections.filter(s => s.visible)
  const hiddenSections = sections.filter(s => !s.visible)

  const getSectionsForGroup = (groupId: string) => 
    visibleSections.filter(s => s.group === groupId)

  const getHiddenSectionsForGroup = (groupId: string) =>
    hiddenSections.filter(s => s.group === groupId)

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
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-800 text-slate-200 transform transition-transform duration-200 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">WebWaka</h1>
          <p className="text-sm text-slate-400 mt-1">Super Admin Dashboard</p>
        </div>

        <nav className="p-3">
          {groups.map(group => {
            const groupSections = getSectionsForGroup(group.id)
            const hiddenGroupSections = getHiddenSectionsForGroup(group.id)
            const isCollapsed = collapsedGroups.has(group.id)
            const hasVisibleSections = groupSections.length > 0

            if (!hasVisibleSections && (!showDevMode || hiddenGroupSections.length === 0)) {
              return null
            }

            return (
              <div key={group.id} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300"
                >
                  <span>{group.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {!isCollapsed && (
                  <ul className="space-y-0.5 mt-1">
                    {groupSections.map(section => (
                      <li key={section.id}>
                        <button
                          onClick={() => onSectionSelect(section.id)}
                          className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${
                            activeSection === section.id
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {section.icon && <span className="text-base">{section.icon}</span>}
                          <span>{section.title}</span>
                        </button>
                      </li>
                    ))}

                    {showDevMode && hiddenGroupSections.map(section => (
                      <li key={section.id}>
                        <div className="px-3 py-2 text-slate-500 text-sm">
                          <div className="flex items-center gap-3 opacity-50">
                            {section.icon && <span className="text-base">{section.icon}</span>}
                            <span className="line-through">{section.title}</span>
                          </div>
                          {section.hiddenReason && (
                            <p className="text-xs text-slate-600 mt-1 ml-7">{section.hiddenReason}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-700 mt-auto">
          <div className="px-3 py-2 text-xs text-slate-500">
            v0.1.0 • Phase 4B
          </div>
        </div>
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
