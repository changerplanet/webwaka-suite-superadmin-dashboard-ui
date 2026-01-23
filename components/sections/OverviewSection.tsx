'use client'

import { useEffect, useState } from 'react'
// API integration: Health endpoint available at Core API
import SectionHeader from '@/components/layout/SectionHeader'
import KpiPlaceholder from '@/components/layout/KpiPlaceholder'
import TablePlaceholder from '@/components/layout/TablePlaceholder'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

export default function OverviewSection() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setHealthData({ status: 'healthy', uptime: 86400 })
      setLoading(false)
    }, 500)
  }, [])

  const kpis = [
    { 
      title: 'Total Users', 
      icon: '👥',
      value: loading ? '...' : '0',
      subtitle: 'Registered users'
    },
    { 
      title: 'Active Partners', 
      icon: '🤝',
      value: loading ? '...' : '0',
      subtitle: 'Active tenants'
    },
    { 
      title: 'Modules Deployed', 
      icon: '📦',
      value: loading ? '...' : '0',
      subtitle: 'Active modules'
    },
    { 
      title: 'System Health', 
      icon: healthData?.status === 'healthy' ? '💚' : '⚠️',
      value: loading ? '...' : (healthData?.status || 'Unknown'),
      subtitle: healthData?.uptime ? `Uptime: ${Math.floor(healthData.uptime / 3600)}h` : 'Checking...'
    },
  ]

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '#' },
          { label: 'Overview' },
        ]}
      />

      <SectionHeader
        title="Overview"
        description="System-wide metrics and activity"
        badge="Controlled by Core"
      />

      {error && (
        <div className="mb-6 p-4 border border-red-300 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">⚠️ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              {loading && <span className="text-xs text-slate-400">Loading...</span>}
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            <div className="text-sm text-slate-600">{kpi.title}</div>
            {kpi.subtitle && (
              <div className="text-xs text-slate-400 mt-1">{kpi.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      <TablePlaceholder columns={['Activity', 'Type', 'User', 'Time']} rows={5} />

      <div className="mt-6 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-500 text-center">
          📌 Activity feed integration coming soon
        </p>
      </div>
    </div>
  )
}
