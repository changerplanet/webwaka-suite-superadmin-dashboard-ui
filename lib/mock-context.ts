import { DashboardContext } from './types'

const allSections = [
  'overview', 'users', 'partners', 'modules', 'permissions', 
  'entitlements', 'feature-flags', 'pricing', 'incentives', 
  'branding', 'ai', 'audit-logs', 'infrastructure', 'settings'
]

export const mockSuperAdminContext: DashboardContext = {
  userId: 'superadmin-001',
  role: 'superadmin',
  permissions: allSections.map(id => ({ id: `view:${id}`, granted: true })),
  entitlements: allSections.map(id => ({ id, active: true })),
  featureFlags: allSections.map(id => ({ 
    id: `section:${id}`, 
    enabled: id !== 'settings'
  })),
}

export const mockLimitedContext: DashboardContext = {
  userId: 'admin-002',
  role: 'admin',
  permissions: [
    { id: 'view:overview', granted: true },
    { id: 'view:users', granted: true },
    { id: 'view:partners', granted: false },
    { id: 'view:modules', granted: false },
    { id: 'view:permissions', granted: false },
    { id: 'view:entitlements', granted: false },
    { id: 'view:feature-flags', granted: false },
    { id: 'view:pricing', granted: false },
    { id: 'view:incentives', granted: false },
    { id: 'view:branding', granted: false },
    { id: 'view:ai', granted: false },
    { id: 'view:audit-logs', granted: true },
    { id: 'view:infrastructure', granted: false },
    { id: 'view:settings', granted: false },
  ],
  entitlements: allSections.map(id => ({ 
    id, 
    active: ['overview', 'users', 'audit-logs'].includes(id)
  })),
  featureFlags: allSections.map(id => ({ id: `section:${id}`, enabled: true })),
}
