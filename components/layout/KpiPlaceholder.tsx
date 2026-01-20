'use client'

interface KpiPlaceholderProps {
  title: string
  icon?: string
}

export default function KpiPlaceholder({ title, icon }: KpiPlaceholderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
      <div className="mt-2 h-4 w-16 bg-slate-50 rounded animate-pulse" />
    </div>
  )
}
