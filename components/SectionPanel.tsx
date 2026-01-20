'use client'

import { DashboardSection } from '@/lib/types'

interface SectionPanelProps {
  section: DashboardSection
}

export default function SectionPanel({ section }: SectionPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">{section.title}</h2>
        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          Controlled by Core
        </span>
      </div>
      
      <div className="h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="font-medium">Section: {section.id}</p>
          <p className="text-sm mt-1">Content rendered by Phase 4A resolver</p>
        </div>
      </div>
    </div>
  )
}
