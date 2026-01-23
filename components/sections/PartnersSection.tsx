'use client'

import { useEffect, useState } from 'react'
import { getUserTenants } from '@/lib/api-client'
import SectionHeader from '@/components/layout/SectionHeader'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

export default function PartnersSection() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Note: Without authentication token, this will return empty or error
        // In production with Clerk, we'd pass the token
        const response = await getUserTenants(null as any)
        setTenants(response.data || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching partners data:', err)
        setError(err.message || 'Failed to load partners data')
        // Set empty array on error to show empty state
        setTenants([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeTenants = tenants.filter(t => t.status === 'active')
  const pendingTenants = tenants.filter(t => t.status === 'pending')

  const kpis = [
    { 
      title: 'Total Partners', 
      icon: '🤝',
      value: loading ? '...' : tenants.length.toString(),
      subtitle: 'All tenants'
    },
    { 
      title: 'Active', 
      icon: '✅',
      value: loading ? '...' : activeTenants.length.toString(),
      subtitle: 'Active tenants'
    },
    { 
      title: 'Pending Review', 
      icon: '⏳',
      value: loading ? '...' : pendingTenants.length.toString(),
      subtitle: 'Awaiting approval'
    },
    { 
      title: 'Revenue Share', 
      icon: '💰',
      value: loading ? '...' : '0%',
      subtitle: 'Average share'
    },
  ]

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '#' },
          { label: 'Partners' },
        ]}
      />

      <SectionHeader
        title="Partners"
        description="Manage partner organizations and tenants"
        badge="Controlled by Core"
      />

      {error && (
        <div className="mb-6 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
          <p className="text-sm text-yellow-700">
            ⚠️ {error}
            <br />
            <span className="text-xs text-yellow-600 mt-1 block">
              Note: Authentication required to fetch partner data. Enable Clerk to see real data.
            </span>
          </p>
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

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Partner Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Since
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Loading partners...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No partners found. {error ? 'Authentication required.' : 'Add your first partner to get started.'}
                  </td>
                </tr>
              ) : (
                tenants.map((tenant, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {tenant.name || 'Unnamed Tenant'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {tenant.type || 'Standard'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tenant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tenant.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {tenant.userCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-500 text-center">
          📌 Partner management actions (create, edit, delete) coming in next iteration
        </p>
      </div>
    </div>
  )
}
