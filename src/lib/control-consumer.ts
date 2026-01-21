/**
 * src/lib/control-consumer.ts
 * 
 * SINGLE CONTROL CONSUMER - All control imports MUST go through this file.
 * NO other file may import control packages directly.
 * 
 * This file is the ONLY place importing from:
 * - webwaka-core-dashboard-control
 * - webwaka-suite-superadmin-dashboard-control
 * 
 * ARCHITECTURE:
 * - This file contains ONLY type adapters and format converters
 * - ALL visibility decisions are delegated to canonical control engine
 * - ALL snapshot operations are delegated to canonical control engine
 * - NO business logic, hashing algorithms, or policy decisions are implemented locally
 * 
 * DASHBOARD DECLARATION NOTE:
 * The dashboard declaration is defined locally because webwaka-suite-superadmin-dashboard-control
 * is a substrate-only package (functions throw "Not implemented - substrate only").
 * When the suite package provides a canonical declaration, this local definition should be removed
 * and the canonical declaration imported instead.
 */

import {
  resolveDashboard as coreResolveDashboard,
  generateDashboardSnapshot as coreGenerateDashboardSnapshot,
  verifyDashboardSnapshot as coreVerifyDashboardSnapshot,
  evaluateFromSnapshot as coreEvaluateFromSnapshot,
  type DashboardDeclaration,
  type DashboardContext as CoreDashboardContext,
  type DashboardSection as CoreDashboardSection,
  type DashboardSnapshot as CoreDashboardSnapshot,
  type ResolvedDashboard as CoreResolvedDashboard,
  type PermissionResult,
  type EntitlementSnapshot,
  type FeatureSnapshot,
  type HiddenReason,
} from 'webwaka-core-dashboard-control';

import {
  MODULE_ID as SUPERADMIN_MODULE_ID,
  VERSION as SUPERADMIN_VERSION,
} from 'webwaka-suite-superadmin-dashboard-control';

/**
 * SuperAdmin Dashboard Declaration
 * 
 * TEMPORARY LOCAL DEFINITION:
 * This declaration is defined locally because webwaka-suite-superadmin-dashboard-control
 * is a substrate-only package with placeholder implementations.
 * 
 * TODO: When webwaka-suite-superadmin-dashboard-control@>=1.0.0 exports a canonical
 * declaration, remove this local definition and import from the package instead.
 */
export const superAdminDashboardDeclaration: DashboardDeclaration = {
  dashboardId: 'superadmin-dashboard',
  label: 'Super Admin Dashboard',
  allowedSubjects: ['super_admin'],
  sections: [
    {
      sectionId: 'overview',
      label: 'Overview',
      icon: '📊',
    },
    {
      sectionId: 'users',
      label: 'User Management',
      icon: '👥',
      requiredCapabilities: ['view:users'],
    },
    {
      sectionId: 'partners',
      label: 'Partners',
      icon: '🤝',
      requiredCapabilities: ['view:partners'],
    },
    {
      sectionId: 'modules',
      label: 'Module Registry',
      icon: '📦',
      requiredCapabilities: ['view:modules'],
    },
    {
      sectionId: 'permissions',
      label: 'Permissions',
      icon: '🔐',
      requiredCapabilities: ['view:permissions'],
    },
    {
      sectionId: 'entitlements',
      label: 'Entitlements',
      icon: '🎫',
      requiredCapabilities: ['view:entitlements'],
    },
    {
      sectionId: 'feature-flags',
      label: 'Feature Flags',
      icon: '🚩',
      requiredCapabilities: ['view:feature-flags'],
    },
    {
      sectionId: 'pricing',
      label: 'Pricing',
      icon: '💰',
      requiredCapabilities: ['view:pricing'],
    },
    {
      sectionId: 'incentives',
      label: 'Incentives',
      icon: '🎁',
      requiredCapabilities: ['view:incentives'],
    },
    {
      sectionId: 'branding',
      label: 'Branding',
      icon: '🎨',
      requiredCapabilities: ['view:branding'],
    },
    {
      sectionId: 'ai-services',
      label: 'AI Services',
      icon: '🤖',
      requiredCapabilities: ['view:ai-services'],
    },
    {
      sectionId: 'analytics',
      label: 'Analytics',
      icon: '📈',
      requiredCapabilities: ['view:analytics'],
    },
    {
      sectionId: 'audit-logs',
      label: 'Audit Logs',
      icon: '📋',
      requiredCapabilities: ['view:audit-logs'],
    },
    {
      sectionId: 'system-config',
      label: 'System Config',
      icon: '⚙️',
      requiredCapabilities: ['admin:system-config'],
    },
    {
      sectionId: 'integrations',
      label: 'Integrations',
      icon: '🔗',
      requiredCapabilities: ['view:integrations'],
    },
  ],
};

/**
 * Section descriptions for UI display
 */
const SECTION_DESCRIPTIONS: Record<string, string> = {
  'overview': 'Platform overview and key metrics',
  'users': 'Manage platform users and access',
  'partners': 'Partner management and onboarding',
  'modules': 'Module registry and configuration',
  'permissions': 'Role and permission management',
  'entitlements': 'Entitlement assignments and tracking',
  'feature-flags': 'Feature flag configuration',
  'pricing': 'Pricing tiers and plans',
  'incentives': 'Incentive programs and rewards',
  'branding': 'Platform branding and theming',
  'ai-services': 'AI service configuration',
  'analytics': 'Platform analytics and reporting',
  'audit-logs': 'Security and audit logging',
  'system-config': 'System configuration',
  'integrations': 'Third-party integrations',
};

/**
 * Section groupings for navigation
 */
const SECTION_GROUPS = [
  { id: 'core', title: 'Core', order: 1, sectionIds: ['overview', 'users', 'partners'] as const },
  { id: 'governance', title: 'Governance', order: 2, sectionIds: ['modules', 'permissions', 'entitlements', 'feature-flags'] as const },
  { id: 'platform', title: 'Platform', order: 3, sectionIds: ['pricing', 'incentives', 'branding', 'ai-services'] as const },
  { id: 'operations', title: 'Operations', order: 4, sectionIds: ['analytics', 'audit-logs', 'system-config', 'integrations'] as const },
] as const;

/**
 * UI-specific dashboard section representation
 */
export interface UIDashboardSection {
  id: string;
  title: string;
  description: string;
  group: string;
  icon: string;
  visible: boolean;
  hiddenReason?: string;
  order: number;
}

/**
 * UI-specific resolved dashboard representation
 */
export interface UIResolvedDashboard {
  sections: UIDashboardSection[];
  groups: { id: string; title: string; order: number }[];
  resolvedAt: string;
  contextHash: string;
}

/**
 * UI dashboard context - requires explicit evaluationTime for determinism
 */
export interface UIDashboardContext {
  userId: string;
  role: 'super_admin';
  tenantId: string;
  evaluationTime: Date;
  permissions: { id: string; granted: boolean }[];
  entitlements: { id: string; active: boolean }[];
  featureFlags: { id: string; enabled: boolean }[];
}

/**
 * UI-compatible dashboard snapshot
 * Wraps canonical CoreDashboardSnapshot with UI-specific resolved dashboard
 */
export interface UIDashboardSnapshot {
  dashboard: UIResolvedDashboard;
  coreSnapshot: CoreDashboardSnapshot;
  createdAt: string;
  expiresAt: string;
}

/**
 * Adapt UI context to canonical context
 * THIN ADAPTER: Only type conversion, no business logic
 */
function adaptContext(uiContext: UIDashboardContext): CoreDashboardContext {
  return {
    subjectId: uiContext.userId,
    subjectType: 'super_admin',
    tenantId: uiContext.tenantId,
    roles: [uiContext.role],
    evaluationTime: uiContext.evaluationTime,
  };
}

/**
 * Adapt UI context to permission result
 * THIN ADAPTER: Only type conversion, no business logic
 */
function adaptPermissions(uiContext: UIDashboardContext): PermissionResult {
  return {
    subjectId: uiContext.userId,
    capabilities: uiContext.permissions
      .filter(p => p.granted)
      .map(p => p.id),
    deniedCapabilities: uiContext.permissions
      .filter(p => !p.granted)
      .map(p => p.id),
  };
}

/**
 * Adapt UI context to entitlement snapshot
 * THIN ADAPTER: Only type conversion, no business logic
 */
function adaptEntitlements(uiContext: UIDashboardContext): EntitlementSnapshot {
  return {
    tenantId: uiContext.tenantId,
    activeEntitlements: uiContext.entitlements
      .filter(e => e.active)
      .map(e => e.id),
    expiredEntitlements: uiContext.entitlements
      .filter(e => !e.active)
      .map(e => e.id),
  };
}

/**
 * Adapt UI context to feature snapshot
 * THIN ADAPTER: Only type conversion, no business logic
 */
function adaptFeatures(uiContext: UIDashboardContext): FeatureSnapshot {
  return {
    enabledFeatures: uiContext.featureFlags
      .filter(f => f.enabled)
      .map(f => f.id),
    disabledFeatures: uiContext.featureFlags
      .filter(f => !f.enabled)
      .map(f => f.id),
  };
}

/**
 * Get section group for a section ID
 * THIN ADAPTER: UI layout helper, not control logic
 */
function getSectionGroup(sectionId: string): string {
  for (const group of SECTION_GROUPS) {
    if ((group.sectionIds as readonly string[]).includes(sectionId)) {
      return group.id;
    }
  }
  return 'core';
}

/**
 * Get section order based on declaration order
 * THIN ADAPTER: UI layout helper, not control logic
 */
function getSectionOrder(sectionId: string): number {
  const index = superAdminDashboardDeclaration.sections.findIndex(
    s => s.sectionId === sectionId
  );
  return index >= 0 ? index + 1 : 999;
}

/**
 * Convert canonical resolved dashboard to UI format
 * THIN ADAPTER: Only type mapping, no business logic
 * 
 * @param coreResolved - Result from canonical resolveDashboard
 * @param coreSnapshot - Canonical snapshot (used for contextHash from checksum - deterministic)
 */
function adaptResolvedDashboard(
  coreResolved: CoreResolvedDashboard,
  coreSnapshot: CoreDashboardSnapshot
): UIResolvedDashboard {
  const allSections: UIDashboardSection[] = [];
  
  for (const section of superAdminDashboardDeclaration.sections) {
    const isVisible = coreResolved.visibleSections.some(
      s => s.sectionId === section.sectionId
    );
    const hiddenReason = coreResolved.reasons.find(
      r => r.sectionId === section.sectionId
    );
    
    allSections.push({
      id: section.sectionId,
      title: section.label,
      description: SECTION_DESCRIPTIONS[section.sectionId] || '',
      group: getSectionGroup(section.sectionId),
      icon: section.icon || '📄',
      visible: isVisible,
      hiddenReason: hiddenReason?.details,
      order: getSectionOrder(section.sectionId),
    });
  }

  return {
    sections: allSections.sort((a, b) => a.order - b.order),
    groups: SECTION_GROUPS.map(g => ({ id: g.id, title: g.title, order: g.order })),
    resolvedAt: coreSnapshot.evaluationTime.toISOString(),
    contextHash: coreSnapshot.checksum,
  };
}

/**
 * Convert canonical resolved dashboard to UI format (for initial resolution without snapshot)
 * THIN ADAPTER: Only type mapping, no business logic
 */
function adaptResolvedDashboardWithoutSnapshot(
  coreResolved: CoreResolvedDashboard,
  evaluationTime: Date,
  checksum: string
): UIResolvedDashboard {
  const allSections: UIDashboardSection[] = [];
  
  for (const section of superAdminDashboardDeclaration.sections) {
    const isVisible = coreResolved.visibleSections.some(
      s => s.sectionId === section.sectionId
    );
    const hiddenReason = coreResolved.reasons.find(
      r => r.sectionId === section.sectionId
    );
    
    allSections.push({
      id: section.sectionId,
      title: section.label,
      description: SECTION_DESCRIPTIONS[section.sectionId] || '',
      group: getSectionGroup(section.sectionId),
      icon: section.icon || '📄',
      visible: isVisible,
      hiddenReason: hiddenReason?.details,
      order: getSectionOrder(section.sectionId),
    });
  }

  return {
    sections: allSections.sort((a, b) => a.order - b.order),
    groups: SECTION_GROUPS.map(g => ({ id: g.id, title: g.title, order: g.order })),
    resolvedAt: evaluationTime.toISOString(),
    contextHash: checksum,
  };
}

/**
 * Resolve dashboard visibility based on context.
 * ALL visibility decisions flow through the canonical Phase 4A control engine.
 * This function is a THIN ADAPTER that converts UI context to canonical format,
 * delegates to the canonical resolveDashboard, and converts the result back.
 * 
 * NOTE: This function uses canonical snapshot generation for the contextHash.
 * It should be called in a server environment where Node.js crypto is available.
 * 
 * @param context - UI dashboard context with explicit evaluationTime (DETERMINISTIC)
 * @returns Resolved dashboard with visibility decisions from Phase 4A
 */
export function resolveDashboard(context: UIDashboardContext): UIResolvedDashboard {
  const coreContext = adaptContext(context);
  const permissionResult = adaptPermissions(context);
  const entitlementSnapshot = adaptEntitlements(context);
  const featureSnapshot = adaptFeatures(context);

  const coreResolved = coreResolveDashboard(
    superAdminDashboardDeclaration,
    coreContext,
    permissionResult,
    entitlementSnapshot,
    featureSnapshot
  );

  const coreSnapshot = coreGenerateDashboardSnapshot(
    superAdminDashboardDeclaration,
    coreResolved,
    coreContext
  );

  return adaptResolvedDashboard(coreResolved, coreSnapshot);
}

/**
 * Generate a snapshot of the resolved dashboard.
 * DELEGATES to canonical snapshot generation - no local hashing/signature logic.
 * 
 * @param dashboard - Resolved UI dashboard
 * @param context - UI dashboard context
 * @param ttlMinutes - Time-to-live in minutes (default 60)
 * @returns Dashboard snapshot with canonical integrity
 */
export function generateDashboardSnapshot(
  dashboard: UIResolvedDashboard,
  context: UIDashboardContext,
  ttlMinutes: number = 60
): UIDashboardSnapshot {
  const coreContext = adaptContext(context);
  const permissionResult = adaptPermissions(context);
  const entitlementSnapshot = adaptEntitlements(context);
  const featureSnapshot = adaptFeatures(context);

  const coreResolved = coreResolveDashboard(
    superAdminDashboardDeclaration,
    coreContext,
    permissionResult,
    entitlementSnapshot,
    featureSnapshot
  );

  const coreSnapshot = coreGenerateDashboardSnapshot(
    superAdminDashboardDeclaration,
    coreResolved,
    coreContext,
    ttlMinutes * 60 * 1000
  );

  const uiDashboard = adaptResolvedDashboard(coreResolved, coreSnapshot);

  return {
    dashboard: uiDashboard,
    coreSnapshot,
    createdAt: coreSnapshot.evaluationTime.toISOString(),
    expiresAt: coreSnapshot.expiresAt?.toISOString() || new Date(coreSnapshot.evaluationTime.getTime() + ttlMinutes * 60 * 1000).toISOString(),
  };
}

/**
 * Verify snapshot integrity and expiration.
 * DELEGATES ENTIRELY to canonical verification - no local policy decisions.
 * 
 * @param snapshot - Dashboard snapshot to verify
 * @param evaluationTime - Explicit evaluation time (DETERMINISTIC)
 * @returns True if snapshot is valid according to canonical rules
 */
export function verifyDashboardSnapshot(
  snapshot: UIDashboardSnapshot,
  evaluationTime: Date
): boolean {
  const isValid = coreVerifyDashboardSnapshot(snapshot.coreSnapshot);
  if (!isValid) {
    return false;
  }

  const coreEvaluated = coreEvaluateFromSnapshot(snapshot.coreSnapshot, evaluationTime);
  
  const hasExpiredReason = coreEvaluated.reasons.length > 0 && 
    coreEvaluated.visibleSections.length === 0;
  
  return !hasExpiredReason;
}

/**
 * Evaluate dashboard from snapshot if valid.
 * DELEGATES ENTIRELY to canonical evaluation - no local policy decisions.
 * 
 * @param snapshot - Dashboard snapshot
 * @param evaluationTime - Explicit evaluation time (DETERMINISTIC)
 * @returns Resolved dashboard or null if snapshot invalid/expired according to canonical rules
 */
export function evaluateFromSnapshot(
  snapshot: UIDashboardSnapshot,
  evaluationTime: Date
): UIResolvedDashboard | null {
  const isValid = coreVerifyDashboardSnapshot(snapshot.coreSnapshot);
  if (!isValid) {
    return null;
  }

  const coreEvaluated = coreEvaluateFromSnapshot(snapshot.coreSnapshot, evaluationTime);
  
  const hasExpiredOrInvalid = coreEvaluated.reasons.length > 0 && 
    coreEvaluated.visibleSections.length === 0;
  
  if (hasExpiredOrInvalid) {
    return null;
  }

  return adaptResolvedDashboardWithoutSnapshot(
    coreEvaluated,
    snapshot.coreSnapshot.evaluationTime,
    snapshot.coreSnapshot.checksum
  );
}

export {
  SUPERADMIN_MODULE_ID,
  SUPERADMIN_VERSION,
};

export type {
  DashboardDeclaration,
  CoreDashboardContext,
  CoreDashboardSection,
  CoreDashboardSnapshot,
  CoreResolvedDashboard,
  PermissionResult,
  EntitlementSnapshot,
  FeatureSnapshot,
  HiddenReason,
};
