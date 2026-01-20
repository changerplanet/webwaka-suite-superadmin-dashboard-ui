import { 
  DashboardContext, 
  ResolvedDashboard, 
  DashboardSnapshot,
  DashboardSection 
} from './types'

const DASHBOARD_SECTIONS: Omit<DashboardSection, 'visible' | 'hiddenReason'>[] = [
  { id: 'overview', title: 'Overview', order: 1 },
  { id: 'users', title: 'User Management', order: 2 },
  { id: 'modules', title: 'Module Registry', order: 3 },
  { id: 'permissions', title: 'Permission Manager', order: 4 },
  { id: 'entitlements', title: 'Entitlements', order: 5 },
  { id: 'feature-flags', title: 'Feature Flags', order: 6 },
  { id: 'audit-logs', title: 'Audit Logs', order: 7 },
  { id: 'settings', title: 'System Settings', order: 8 },
]

function hashContext(context: DashboardContext): string {
  const data = JSON.stringify({
    userId: context.userId,
    role: context.role,
    permissions: context.permissions.map(p => `${p.id}:${p.granted}`).sort(),
    entitlements: context.entitlements.map(e => `${e.id}:${e.active}`).sort(),
    featureFlags: context.featureFlags.map(f => `${f.id}:${f.enabled}`).sort(),
  })
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

function checkSectionVisibility(
  sectionId: string,
  context: DashboardContext
): { visible: boolean; hiddenReason?: string } {
  const requiredPermission = context.permissions.find(p => p.id === `view:${sectionId}`)
  if (requiredPermission && !requiredPermission.granted) {
    return { visible: false, hiddenReason: `Permission 'view:${sectionId}' not granted` }
  }

  const requiredEntitlement = context.entitlements.find(e => e.id === sectionId)
  if (requiredEntitlement && !requiredEntitlement.active) {
    return { visible: false, hiddenReason: `Entitlement '${sectionId}' not active` }
  }

  const featureFlag = context.featureFlags.find(f => f.id === `section:${sectionId}`)
  if (featureFlag && !featureFlag.enabled) {
    return { visible: false, hiddenReason: `Feature flag 'section:${sectionId}' disabled` }
  }

  return { visible: true }
}

export function resolveDashboard(context: DashboardContext): ResolvedDashboard {
  const sections: DashboardSection[] = DASHBOARD_SECTIONS.map(section => {
    const visibility = checkSectionVisibility(section.id, context)
    return {
      ...section,
      visible: visibility.visible,
      hiddenReason: visibility.hiddenReason,
    }
  })

  return {
    sections: sections.sort((a, b) => a.order - b.order),
    resolvedAt: new Date().toISOString(),
    contextHash: hashContext(context),
  }
}

export function generateDashboardSnapshot(
  dashboard: ResolvedDashboard,
  ttlMinutes: number = 60
): DashboardSnapshot {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000)
  
  const signatureData = `${dashboard.contextHash}:${dashboard.resolvedAt}:${expiresAt.toISOString()}`
  let signature = 0
  for (let i = 0; i < signatureData.length; i++) {
    signature = ((signature << 5) - signature) + signatureData.charCodeAt(i)
    signature = signature & signature
  }

  return {
    dashboard,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    signature: Math.abs(signature).toString(16),
  }
}

export function verifyDashboardSnapshot(snapshot: DashboardSnapshot): boolean {
  const now = new Date()
  const expiresAt = new Date(snapshot.expiresAt)
  
  if (now > expiresAt) {
    return false
  }

  const signatureData = `${snapshot.dashboard.contextHash}:${snapshot.dashboard.resolvedAt}:${snapshot.expiresAt}`
  let expectedSignature = 0
  for (let i = 0; i < signatureData.length; i++) {
    expectedSignature = ((expectedSignature << 5) - expectedSignature) + signatureData.charCodeAt(i)
    expectedSignature = expectedSignature & expectedSignature
  }

  return snapshot.signature === Math.abs(expectedSignature).toString(16)
}

export function evaluateFromSnapshot(snapshot: DashboardSnapshot): ResolvedDashboard | null {
  if (!verifyDashboardSnapshot(snapshot)) {
    return null
  }
  return snapshot.dashboard
}
