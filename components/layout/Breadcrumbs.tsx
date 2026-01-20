'use client'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 text-slate-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href && index !== items.length - 1 ? (
            <a href={item.href} className="text-slate-500 hover:text-slate-700 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className={index === items.length - 1 ? 'text-slate-800 font-medium' : 'text-slate-500'}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
