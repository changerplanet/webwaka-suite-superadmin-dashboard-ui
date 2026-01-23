'use client'

import { useEffect, useState } from 'react'
import { getRoles } from '@/lib/api-client'
import SectionHeader from '@/components/layout/SectionHeader'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

export default function PermissionsSection() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await getRoles(null as any)
        setRoles(response.data || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching permissions data:', err)
        setError(err.message || 'Failed to load permissions data')
        setRoles([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalPermissions = roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)

  const kpis = [
    { 
      title: 'Roles Defined', 
      icon: '🔐',
      value: loading ? '...' : roles.length.toString(),
      subtitle: 'Total roles'
    },
    { 
      title: 'Permissions', 
      icon: '🔑',
      value: loading ? '...' : totalPermissions.toString(),
      subtitle: 'Total permissions'
    },
    { 
      title: 'Policy Rules', 
      icon: '📜',
      value: loading ? '...' : '0',
      subtitle: 'Active policies'
    },
    { 
      title: 'Overrides', 
      icon: '⚡',
      value: loading ? '...' : '0',
      subtitle: 'Custom overrides'
    },
  ]

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '#' },
          { label: 'Permissions' },
        ]}
      />

      <SectionHeader
        title="Permissions"
        description="Role-based access control and permissions"
        badge="Controlled by Core"
      />

      {error && (
        <div className="mb-6 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
          <p className="text-sm text-yellow-700">
            ⚠️ {error}
            <br />
            <span className="text-xs text-yellow-600 mt-1 block">
              Note: Authentication required to fetch permissions data. Enable Clerk to see real data.
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
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    Loading roles and permissions...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    No roles found. {error ? 'Authentication required.' : 'Create your first role to get started.'}
                  </td>
                </tr>
              ) : (
                roles.map((role, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {role.name || 'Unnamed Role'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {role.scope || 'Global'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.slice(0, 3).map((perm: string, j: number) => (
                            <span key={j} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {perm}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">No permissions</span>
                        )}
                        {role.permissions && role.permissions.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
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
          📌 Role management actions (create, edit, assign permissions) coming in next iteration
        </p>
      </div>
    </div>
  )
}
