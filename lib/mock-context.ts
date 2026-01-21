/**
 * lib/mock-context.ts
 * 
 * Mock contexts for development and testing.
 * These use explicit evaluationTime for determinism.
 */

import type { UIDashboardContext } from '@/src/lib/control-consumer';

const allSections = [
  'overview', 'users', 'partners', 'modules', 'permissions', 
  'entitlements', 'feature-flags', 'pricing', 'incentives', 
  'branding', 'ai', 'audit-logs', 'infrastructure', 'settings'
];

/**
 * Get mock context with explicit evaluation time for determinism.
 * MUST pass an explicit evaluationTime - no implicit new Date() allowed.
 */
export function createMockSuperAdminContext(evaluationTime: Date): UIDashboardContext {
  return {
    userId: 'superadmin-001',
    role: 'super_admin',
    tenantId: 'platform',
    evaluationTime,
    permissions: allSections.map(id => ({ id: `view:${id}`, granted: true })),
    entitlements: allSections.map(id => ({ id, active: true })),
    featureFlags: allSections.map(id => ({ 
      id: `section:${id}`, 
      enabled: id !== 'settings'
    })),
  };
}

/**
 * Get limited mock context with explicit evaluation time for determinism.
 */
export function createMockLimitedContext(evaluationTime: Date): UIDashboardContext {
  return {
    userId: 'admin-002',
    role: 'super_admin',
    tenantId: 'platform',
    evaluationTime,
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
  };
}

/**
 * Legacy exports for backward compatibility
 * Uses a fixed deterministic timestamp for testing
 */
const FIXED_EVALUATION_TIME = new Date('2024-01-15T12:00:00.000Z');

export const mockSuperAdminContext = createMockSuperAdminContext(FIXED_EVALUATION_TIME);
export const mockLimitedContext = createMockLimitedContext(FIXED_EVALUATION_TIME);
