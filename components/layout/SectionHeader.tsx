'use client'

import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  badge?: string
  actions?: ReactNode
}

export default function SectionHeader({
  title,
  description,
  badge,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-slate-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
